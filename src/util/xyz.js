const CoordinateSys = require('./coordinateSys');

const epsg = 3857;
const coordinateSys = new CoordinateSys(epsg);
//地理边界转xyz范围
function bound2xyzs(bound,tz){
	//console.log(bound,tz);
	const minTileXY = coordinateSys.point2Tile(bound[0], bound[1], tz);
    const maxTileXY = coordinateSys.point2Tile(bound[2], bound[3], tz);
	//console.log(64,63,tz,minTileXY,maxTileXY);
    const tminx = Math.max(0, minTileXY.tileX);
    const tminy = Math.max(0, minTileXY.tileY);
	let tmaxx,tmaxy;
    if (epsg === 3857) {
      tmaxx = Math.min(Math.pow(2, tz) - 1, maxTileXY.tileX);
      tmaxy = Math.min(Math.pow(2, tz) - 1, maxTileXY.tileY);
    } else {
      tmaxx = Math.min(Math.pow(2, tz + 1) - 1, maxTileXY.tileX);
      tmaxy = Math.min(Math.pow(2, tz + 1) - 1, maxTileXY.tileY);
    }



	const xyz1 = [tminx,Math.pow(2, tz)-tmaxy,tz];
	const xyz2 = [tmaxx,Math.pow(2, tz)-tminy,tz];
	return [xyz1,xyz2];
}

module.exports = {bound2xyzs};