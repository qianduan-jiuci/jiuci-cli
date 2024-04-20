const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const ls = require("log-symbols");
const inquirer = require("inquirer");
const ora = require("ora");
const shell = require("shelljs");
const _ = require("lodash");
const download = require("download-git-repo");
const { getAllTemplates, gitTogitDown } = require("../utils");
const spinner = ora("下载中...");

const promptList = [
  // 具体交互内容
  {
    type: "input",
    name: "author",
    message: "作者",
    default: "",
  },
  {
    type: "input",
    name: "mail",
    message: "邮箱",
    default: "",
  },
  {
    type: "input",
    name: "description",
    message: "描述",
    default: "",
  },
  {
    type: "input",
    name: "gitRepo",
    message: "git 地址",
    default: "",
  },
];

const create = function (projectName = "", options) {
  // 获取当前路径
  const cwd = process.cwd();
  let targetDir = path.resolve(cwd, projectName || ".");
  // 获取当前所有可选模板
  const templates = getAllTemplates();
  const keys = Object.keys(templates);
  // 将可选模板添加到用户交互中， 供用户选择
  const templateRequire = {
    type: "list",
    name: "template",
    message: "请初始化您的template",
    choices: keys,
  };
  // 添加可选包管理工具
  const npmPackgetToolRequire = {
    type: "list",
    name: "npm",
    message: "请选择包管理工具",
    choices: ["npm", "pnpm", "cnpm", "yarn"],
  };
  promptList.unshift(templateRequire, npmPackgetToolRequire);
  if (!projectName) {
    const promptName = {
      type: "input",
      name: "name",
      message: "请输入项目的名称",
      default: "",
    };
    promptList.unshift(promptName);
  }
  // 检查当前目录下时候是否已经存在该文件夹
  if (projectName && fs.existsSync(targetDir)) {
    throw Error("当前路径已经存在同名文件夹，请重试");
  }

  // 创建交互
  inquirer.prompt(promptList).then((answer) => {
    // 拉取模板
    const { template, description, author, mail, gitRepo, npm, name } = answer;

    console.log(ls.info, chalk.blue(`正在拉取${template}模板`));

    projectName = projectName || name;
    targetDir = path.resolve(cwd, projectName || ".");
    const url = gitTogitDown(templates[template]);

    console.log(ls.info, chalk.blue("正在创建项目：" + projectName));

    spinner.start();
    downTemplate(url, projectName, () => {
      // 将内容写入到配置文件中
      writePackageJSON(targetDir, answer, projectName);
      // cd对应到当前目录
      shell.cd(targetDir);
      // 创建git
      if (gitRepo) gitInit(gitRepo);
      // 安装依赖
      // install(npm);
      //成功之后的输出
      successNotify(projectName, npm);
    });
  });
};

// 下载响应模板依赖
const downTemplate = function (url, projectName, callback) {
  download(url, projectName, { clone: true }, (error) => {
    if (error) {
      spinner.fail();
      throw error;
    } else {
      spinner.succeed();
      callback();
    }
  });
};

// 将配置中的内容写入package文件中
const writePackageJSON = function (targetDir, answer, name) {
  const { description, author, mail } = answer;
  const packPath = targetDir + "/package.json";
  // 读出文件内容
  const templateJSON = fs.readFileSync(packPath);
  const packageJSON = JSON.parse(templateJSON);
  const result = {
    ...packageJSON,
    description,
    author,
    mail,
    name,
  };
  // 将内容写入packagejson中
  fs.writeFileSync(packPath, JSON.stringify(result, null, "\t"));
};

// 为当前的git添加远程仓库
const gitInit = function (gitRepo) {
  if (!shell.which("git")) {
    shell.echo("请检查本机git环境是否正常");
    shell.exec(1);
  } else {
    shell.exec("git init");
    if (!_.isEmpty(gitRepo)) {
      shell.exec("git remote add origin " + gitRepo);
      shell.exec(`git checkout -b main`);
      shell.exec("git pull origin main");
      shell.exec("git add .");
      shell.exec("git commit -m 'init'");
      shell.exec(`git push --set-upstream origin main`);
    }
  }
};

// 安装依赖
const install = function (ways) {
  shell.exec(`${ways} install`);
};

// 输出
const successNotify = function (projectName, ways) {
  console.log(ls.success, chalk.green(`success`));
  // console.log(`

  //   #####################   #######################    ##                  ##           ############    ######################
  //            ##                      ##                ##                  ##          ##                          ##
  //            ##                      ##                ##                  ##        ##                            ##
  //            ##                      ##                ##                  ##       ##                             ##
  //            ##                      ##                ##                  ##      ##                              ##
  //            ##                      ##                ##                  ##      ##                              ##
  //   #        ##                      ##                ##                  ##       ##                             ##
  //    ##      ##                      ##                ##                  ##         ##                           ##
  //     ###    ##                      ##                ##                  ##            ##                        ##
  //      ########             #####################      ######################              ############ #######################

  //      `);
  console.log("\n" + chalk.magenta(`${projectName}创建成功, 执行下面命令启动`));
  console.log("\n\t" + chalk.magenta.underline(`cd ${projectName}`));
  console.log("\t" + chalk.magenta.underline(`${ways} install`));
  console.log("\t" + chalk.magenta.underline(`${ways} run dev`) + "\n\n");
};

module.exports = create;
