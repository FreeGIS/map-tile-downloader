/**
 * 进度条实现。
 */
//const log = require('./log');
var log = require('single-line-log').stdout;
const format = require('./format');
const clicolor = require('cli-color');
/**
 * 封装一个进度条工具。
 */
function ProgressBar(description, bar_length) {
    this.description = description || "PROGRESS";
    this.length = bar_length.length || 28;

    // 刷新进度条图案，文字的方法
    this.render = function(opts) {
        var percentage = (opts.completed/opts.total).toFixed(4);
        var cell_num = Math.floor(percentage * this.length);
        // 拼接黑色条
        var cell = '';
        for(var i = 0; i < cell_num; i++) {
            cell += '█';
        }
        // 拼接灰色条
        var empty = '';
        for(var i = 0; i < this.length - cell_num; i++) {
            empty += '░';
        }
        
        var percent = (100*percentage).toFixed(2);
        /**
         * 使用cli-color进行包装美化。
         */
        this.description = clicolor.blue.bold(this.description);
        cell = clicolor.green.bgBlack.bold(cell);
        opts.completed = clicolor.yellow.bold(opts.completed);
        opts.failed = clicolor.red.bold(opts.failed);
        

        opts.total = clicolor.blue.bold(opts.total);
        opts.status = percent==100.00?clicolor.green.bold(opts.status):clicolor.red.bold(opts.status);


        // 拼接最终文本
        var cmdtext = format("<{}:{}%> {}{}  [ {}/{} 失败切片数量：{} {}]", [this.description, percent,
        cell, empty, opts.completed, opts.total, opts.failed, opts.status]);
        log(cmdtext);
    };
}


/**
 * 模块导出。
 */
module.exports = ProgressBar;