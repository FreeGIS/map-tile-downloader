var fs=require('fs');
var path=require('path');
//根据文件，同步递归创建其上一级目录
function createDirs(file) {
	//获取文件根目录
	let dirpath=path.dirname(file);
	//有路径直接回调走
	if(fs.existsSync(dirpath)){
        return true;
    }else{
        if(createDirs(dirpath)){
            fs.mkdirSync(dirpath);
            return true;
        }
    }
};
module.exports=createDirs;