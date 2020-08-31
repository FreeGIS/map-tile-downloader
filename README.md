# MapTileTool
## 一 作用

下载公网地图服务器中以xyz及其类xyz形式的地图切片，用于离线GIS系统底图使用。该xyz形式为基于墨卡托投影的坐标系，切片大小为256*256规格。

## 二 限制

1. xyz切片原点是基于左上角，大部分切片符合这个规则，百度切片原点在中心点，不符合。
2. xyz切片大小为标准的256 * 256，大部分切片大小符合这个规则，类似cesium地形大小为64 * 64不符合。

## 三 支持范围

1 支持esri公网这种不需要带token的切片下载。

2 支持天地图，mapbox这种带token的切片下载，由于这类服务器对单token的请求数量和请求规则做了爬虫限制，需自备一个token列表，绕开数量限制和请求行为限制。

3 大部分明显为墨卡托的xyz格式的切片都可以下载。

## 四 使用说明

### 4.1 安装

源码形式：

```shell
git clone git@github.com:FreeGIS/MapTileTool.git
cd MapTileTool
npm install
npm link
```

npm安装命令行形式：

```
npm install MapTileTool -g
```

验证安装：

```
freetile -h
Usage: freetile [options]

Options:
  -f, --config_file <String>  底图下载配置文件
  -h, --help                  display help for command
```

### 4.2 下载配置

工程目录config下有若干下载模板，配置参数说明如下：

bound：下载切片的wgs84坐标系的地理范围。

levels：下载切片的级别数组。

parallel：下载请求的并发数。

mapurl：下载切片服务xyz模板。

tileformat：明确指定下载切片的格式，如png jpeg pbf webp等。

downPath：下载切片本地存储目录。

tokenInfo：可选，对需要指定token的服务在此设置，该设置有三个选项。

​			location:token位置，枚举型，枚举值为"url"与"headers"。该设置用于明确指定token是在url里申明还是 headers里申明，这需要根据具体服务明确。例如：天地图和mapbox都是url中加token，而cesium地形却是在headers里申明。

​			key：token值绑定的主键，例如天地图是xxxx?tk=xxxxx，那么key就配置为"tk"。

​			values：token值数组，多配置几个，用于随机获取token下载，避免请求数量和行为限制。

### 4.3 切片下载

```
freetile -f D:/xxx/xx/esri.json
```



