var ProgressBar = require('./progressbar/index');

function FreeTile_Status(xyzCount){
    this.sucessCount=0;//成功总数
    this.errorTiles={};//错误切片明细
    this.errorCount=0;
    this.tileCount=xyzCount;//切片任务总数
    this.currentIndex=0;
    this.pb=new ProgressBar('下载进度', 100);
}

//设置切片任务总数
FreeTile_Status.prototype.setTileCount=function(xyzCount){
    this.tileCount=xyzCount;
}
//得到错误切片总数
FreeTile_Status.prototype.getErrorTileCount=function(){
    return Object.keys(this.errorTiles).length;
}
//得到错误切片的数组
FreeTile_Status.prototype.getErrorTiles=function(){
    let errotTiles=[];
    let self=this;
    Object.keys(this.errorTiles).forEach(function(key) {
        errotTiles.push(self.errorTiles[key].tile);
    });
    return errotTiles;
}

//新增一个 错误切片
FreeTile_Status.prototype.addErrorTile=function(xyz){
    let id=xyz.join("-");
    //只有不存在该tile，加入统计
    if(!this.errorTiles[id])
    {
        this.errorTiles[id]={
            tile:xyz,
            err_num:1
        };
        this.errorCount++;
    }
    //错误集合已存在该tile，则计数，累计5次，判定是废弃切片请求，直接移除
    else{
        this.errorTiles[id].err_num++;
        if(this.errorTiles[id].err_num==5){
            delete this.errorTiles[id];
            this.currentIndex++;
        }
    }
    this.showStatus();
}

//正确处理的切片
FreeTile_Status.prototype.addSuccessTile=function(xyz){
    const id=xyz.join("-");
    delete this.errorTiles[id];
    //成功总数加1
    this.sucessCount++;
    this.currentIndex++;
    this.showStatus();
}



FreeTile_Status.prototype.showStatus=function(){
    if(this.currentIndex<this.tileCount){
        this.pb.render({ completed: this.currentIndex,failed:this.errorCount, total: this.tileCount, status: '下载中...' });
    }
    else{
        this.pb.render({ completed: this.currentIndex,failed:this.errorCount, total: this.tileCount, status: '下载完毕.' });
    }
}

module.exports = FreeTile_Status;