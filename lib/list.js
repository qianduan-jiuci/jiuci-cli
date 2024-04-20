const fs = require("fs-extra");
const { getAllTemplates } = require("../utils");
const chalk = require("chalk");

const list = function () {
  const templates = getAllTemplates();
  const keys = Object.keys(templates);
  for (const value of keys) {
    console.log(chalk.greenBright.bold.underline(value));
  }
};

module.exports = list;
