const fs = require("fs");
const superagent = require('superagent');
const getTileUrl=require('./util/getTileUrl');
const FreeTile_Status=require('./util/freetile_status');
const createDirs=require('./util/create_dir');
const {bound2xyzs}=require('./util/xyz');
const getRandomUserAgent=require('./util/userAgent');


    
//config设置为全局变量
let TileConfig;
//下载状态提示
let freetile_status=new FreeTile_Status();

function run(config){
    TileConfig=config;
    //获取下载地理范围
    const bound=TileConfig.bound;
    //获取下载级别
    const levels=TileConfig.levels;
    //根据地理范围和级别，获取下载的xyz区间
    const xyzMetedata=getXYZMetedata(bound,levels);
  
	//设置进度提示总数
    freetile_status.setTileCount(xyzMetedata.tileCount);
    //获取下载列表
    const xyzs=xyzMetedata.xyzs;
    //执行下载任务
    tileTask(xyzs);
    //执行错误切片补充下载
    errorTileTask();
}

//切片下载元数据
function getXYZMetedata(bound,levels){
    let xyzMetedata={
        tileCount:0,
        xyzs:{}
    };
    for(let i=0;i<levels.length;i++){
        const xyzs=bound2xyzs(bound,levels[i]);
        //行列号之差做乘
        xyzMetedata.tileCount+=(xyzs[1][1]-xyzs[0][1]+1)*(xyzs[1][2]-xyzs[0][2]+1);
        xyzMetedata.xyzs[levels[i]]=bound2xyzs(bound,levels[i]);
    }
    return xyzMetedata;
}

//切片下载任务
async function tileTask(xyz_obj){
   
    let promises=[];
    for(let key in xyz_obj){
        const z=parseInt(key);
        const min_col=xyz_obj[key][0][1];
        const max_col=xyz_obj[key][1][1];
        const min_row=xyz_obj[key][0][2];
        const max_row=xyz_obj[key][1][2];
        for(let row=min_row;row<=max_row;row++){
            for(let col=min_col;col<=max_col;col++){
                promises.push(getTile2Disk([z,col,row]));
                //根据访问并发设置，并发请求
                if(promises.length==TileConfig.parallel){
                    await Promise.all(promises);
                    promises=[];
                }
            }
        }
    }
    if(promises.length>0){
        await Promise.all(promises);
        promises=[];
    }
}

async function errorTileTask(){
    //如果错误切片数量为0，结束递归下载
	if(freetile_status.errorCount==0){
		return;
    }
    else{
        let promises=[];
        const xyzs=freetile_status.getErrorTiles();
        for(let i=0;i<xyzs.length;i++){
            promises.push(getTile2Disk(xyzs[i]));
             //根据访问并发设置，并发请求
             if(promises.length==TileConfig.parallel){
                await Promise.all(promises);
                promises=[];
            }
        }
        if(promises.length>0){
            await Promise.all(promises);
            promises=[];
        }
        errorTileTask();
    }
}



//切片下载
function getTile2Disk(xyz){
    var p = new Promise(function(resolve, reject){
        //存储到本地的目录
        let target=`${TileConfig.downPath}/${xyz[0]}/${xyz[1]}/${xyz[2]}.${TileConfig.tileformat}`;
        //在线切片url地址
        let source=getTileUrl(TileConfig.mapurl,xyz,TileConfig.tokenInfo);
        //递归创建目录
        createDirs(target);
        //创建写入文件流
        var writeStream=fs.createWriteStream(target,{autoClose:true});
        let userAgent=getRandomUserAgent();
        //从远程服务器请求 切片，写入本地磁盘文件
        superagent.get(source)
                .responseType('blob')
                .set(userAgent).timeout({
                    response: 30000,  
                    deadline: 60000, 
                })
                .retry(3)
                .on('error',function(err){
                    console.log(err);
                    //下载处理失败，记录失败瓦片状态，一般是 超时
                    freetile_status.addErrorTile(xyz);
                    reject(err);
                })
                .pipe(writeStream)
                .on('finish',function(){
                    //下载成功，判定处理完毕
                    freetile_status.processTile(xyz);
                    resolve('success');
        });
    });
    return p;
}

module.exports=run;