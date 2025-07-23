#!/usr/bin/env node
const { program } = require('commander');
const run = require("../src/app");
//定义命令行帮助命令
program.option('-f, --config_file <String>', '底图下载配置文件');
//解析命令行参数
program.parse(process.argv);
console.log(process.argv);
console.log(program);

const options = program.opts();

//检查参数
if (!options.config_file) {
  console.log('底图下载配置文件config_file路径必填！');
  process.exit();
}
const config=require(options.config_file);
run(config);



process.on('uncaughtException', function (err) {
  //打印出错误
  console.log(err);
  //打印出错误的调用栈方便调试
  console.log(err.stack);
 });
//process全局对象
process.on('SIGINT', function (e) {
  console.log(e);
  process.exit();
});