function FreeTile_Status(xyzCount){
    this.sucessCount=0;//成功总数
    this.errorCount=0; //错误总数
    this.currentIndex=0;//当前下载序号
    this.errorTiles={};//错误切片明细
    this.tileCount=xyzCount;
}


FreeTile_Status.prototype.setTileCount=function(xyzCount){
    this.tileCount=xyzCount;
}


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
    //console.log(xyz);
    let id=xyz.join("-");
    //只有不存在该tile，加入统计
    if(!this.errorTiles[id])
    {
        this.errorTiles[id]={
            tile:xyz,
            err_num:1
        };
        this.errorCount++;
        this.currentIndex++;
    }
    //错误集合已存在该tile，则计数，累计5次，判定是废弃切片请求，直接移除
    else{
        this.errorTiles[id].err_num++;
        if(this.errorTiles[id].err_num==5)
            this.processTile(xyz);
    }
    this.showStatus();
}
//正确处理的切片
FreeTile_Status.prototype.processTile=function(xyz){
    let id=xyz.join("-");
    //处理的错误切片
    if(this.errorTiles[id]){
        delete this.errorTiles[id];
        //错误序列减1
        this.errorCount--;
    }
    else
        this.currentIndex++;
     //成功总数加1
    this.sucessCount++;
    this.showStatus();
}

FreeTile_Status.prototype.showStatus=function(){
    //如果成功数为100的整除或者全部成功
    if(this.currentIndex%100==0||this.sucessCount==this.tileCount)
    console.info(
        ('当前进度:'+this.currentIndex+'/'+this.tileCount).info,
        ('请求成功:'+this.sucessCount).info,
        ('请求失败:'+this.errorCount).error
    );//提示进度
}

module.exports = FreeTile_Status;