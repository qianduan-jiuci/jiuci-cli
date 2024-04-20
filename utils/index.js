const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const symbols = require("log-symbols");
const _ = require("lodash");
const customerRegister = require("../json/customRegister.json");
const registers = require("../json/registers.json");

const getAllTemplates = function () {
  return {
    ...registers,
    ...customerRegister,
  };
};

const gitTogitDown = function (url) {
  return url;
};

module.exports = { getAllTemplates, gitTogitDown };
