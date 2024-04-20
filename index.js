#!/usr/bin/env node
const create = require("./lib/init.js");
const list = require("./lib/list");
// const onAdd = require("./lib/onAdd");
// const onDel = require("./lib/onDel");
// 读取依赖
const { program } = require("commander");
// 查看版本号
const packageConfig = require("./package.json");
program.version(packageConfig.version);

// init

program
  .command("init [name]")
  .alias("i")
  .description("新建项目")
  .action((name, cmd) => {
    create(name);
  });

// 查看模板
program.command("ls").description("查看当前所有模板").action(list);

// // 添加模板
// program
//   .command("add <name> <url>")
//   .alias("a")
//   .description(
//     "本地添加模板， 域名:所有者/项目名称#分支 例如: https://github.com:qianduan-jiuci/vue3_ts_template.git#main"
//   )
//   .action(onAdd);

// // 删除模板
// program
//   .command("del <name>")
//   .alias("d")
//   .description("移除本地模板")
//   .action(onDel);

program.on("--help", () => {});
// 必须放到最后一行，解析所有命令
program.parse(process.argv);
