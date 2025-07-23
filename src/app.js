const fs = require("fs");
const path = require("path");
const superagent = require('superagent');
const { getTileUrl, getRandomToken } = require('./util/getTileUrl');
const FreeTile_Status = require('./util/freetile_status');
const createDirs = require('./util/create_dir');
const { bound2xyzs } = require('./util/xyz');
const getRandomUserAgent = require('./util/userAgent');
const proj4 = require('proj4');

//config设置为全局变量
let TileConfig;
//下载状态提示
let freetile_status = new FreeTile_Status();

function run(config) {
    TileConfig = config;
    //获取下载地理范围
    const bound = TileConfig.bound;
    //获取下载级别
    const levels = TileConfig.levels;
    //根据地理范围和级别，获取下载的xyz区间
    const xyzMetedata = getXYZMetedata(bound, levels);

    //设置进度提示总数
    freetile_status.setTileCount(xyzMetedata.tileCount);
    //获取下载列表
    const xyzs = xyzMetedata.xyzs;
    //执行下载任务，同步方法仅仅内部同步，外部仍然跳下一行执行
    tileTask(xyzs);
}

//切片下载元数据
function getXYZMetedata(bound, levels) {
    const mktbound1 = proj4('EPSG:4326', 'EPSG:3857', [bound[0], bound[1]]);
    const mktbound2 = proj4('EPSG:4326', 'EPSG:3857', [bound[2], bound[3]]);
    const mktbound = [mktbound1[0], mktbound1[1], mktbound2[0], mktbound2[1]];
    let xyzMetedata = {
        tileCount: 0,
        xyzs: {}
    };
    for (let i = 0; i < levels.length; i++) {
        const xyzs = bound2xyzs(mktbound, levels[i]);
        //行列号之差做乘
        xyzMetedata.tileCount += (xyzs[1][0] - xyzs[0][0] + 1) * (xyzs[1][1] - xyzs[0][1] + 1);
        xyzMetedata.xyzs[levels[i]] = xyzs;
    }
    return xyzMetedata;
}

//切片下载任务
async function tileTask(xyz_obj) {
    let promises = [];
    for (let key in xyz_obj) {
        const z = parseInt(key);
        const min_col = xyz_obj[key][0][0];
        const max_col = xyz_obj[key][1][0];
        const min_row = xyz_obj[key][0][1];
        const max_row = xyz_obj[key][1][1];
        for (let row = min_row; row <= max_row; row++) {
            for (let col = min_col; col <= max_col; col++) {
                promises.push(getTile2Disk([z, col, row]));
                //根据访问并发设置，并发请求
                if (promises.length == TileConfig.parallel) {
                    await Promise.all(promises);
                    promises = [];
                }
            }
        }
    }
    if (promises.length > 0) {
        await Promise.all(promises);
        promises = [];
    }
    //执行错误补充下载
    errorTileTask();
}

async function errorTileTask() {
    //如果错误切片数量为0，结束递归下载
    if (freetile_status.getErrorTileCount() == 0) {
        return;
    }
    else {
        let promises = [];
        const xyzs = freetile_status.getErrorTiles();
        for (let i = 0; i < xyzs.length; i++) {
            promises.push(getTile2Disk(xyzs[i]));
            //根据访问并发设置，并发请求
            if (promises.length == TileConfig.parallel) {
                await Promise.all(promises);
                promises = [];
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
            promises = [];
        }
        errorTileTask();
    }
}



//切片下载
function getTile2Disk(xyz) {
    var p = new Promise(function (resolve, reject) {
        //存储到本地的目录
        const target = `${TileConfig.downPath}/${xyz[0]}/${xyz[1]}/${xyz[2]}.${TileConfig.tileformat}`;
        if (fs.existsSync(target)) {
            freetile_status.addSuccessTile(xyz);
            resolve('success');
            return;
        }
        //在线切片url地址
        let source = getTileUrl(TileConfig.mapurl, xyz, TileConfig.tokenInfo);
        //递归创建目录
        createDirs(target);
        const userAgent = getRandomUserAgent();
        //设置一些token什么的
        if (!TileConfig.tokenInfo) {
            //从远程服务器请求 切片，写入本地磁盘文件
            superagent.get(source)
                .responseType('blob')
                .set(userAgent).timeout({
                    response: 20000,
                    deadline: 40000,
                })
                .retry(0)
                .end(getTileCallback);
        }
        else {
            if (TileConfig.tokenInfo.location === "url") {
                const token_key = TileConfig.tokenInfo.key;
                const token_value = getRandomToken(TileConfig.tokenInfo.values);
                if (source.includes('?'))
                    source = `${source}&${token_key}=${token_value}`;
                else
                    source = `${source}?${token_key}=${token_value}`;
                //从远程服务器请求 切片，写入本地磁盘文件
                superagent.get(source)
                    .responseType('blob')
                    .set(userAgent).timeout({
                        response: 30000,
                        deadline: 60000,
                    })
                    .retry(3)
                    .end(getTileCallback);
            }
            else if (TileConfig.tokenInfo.location === "headers") {
                const token_key = TileConfig.tokenInfo.key;
                const token_value = getRandomToken(TileConfig.tokenInfo.values);
                //从远程服务器请求 切片，写入本地磁盘文件
                superagent.get(source)
                    .responseType('blob')
                    .set(token_key, token_value)
                    .set(userAgent).timeout({
                        response: 30000,
                        deadline: 60000,
                    })
                    .retry(3)
                    .end(getTileCallback);
            }
        }
        function getTileCallback(err, res) {
            if (err) {
                console.log(xyz);
                freetile_status.addErrorTile(xyz);
                reject(err);
            } else {
                if (res.status == 200) {
                    //写入磁盘
                    fs.writeFileSync(target, res.body);
                    freetile_status.addSuccessTile(xyz);
                    resolve('success');
                }
            }
        }

    }).then(undefined, (error) => {
        //错误不做额外处理
    });
    return p;
}



module.exports = run;