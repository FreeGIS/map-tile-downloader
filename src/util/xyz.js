const globalMercator = require('global-mercator');

//地理边界转xyz范围
function bound2xyzs(bound,z){
	const xyz1 = globalMercator.pointToTile([bound[0],bound[3]], z);
	const xyz2 = globalMercator.pointToTile([bound[2],bound[1]], z);
	return [xyz1,xyz2];
}

module.exports = {xyz2bound,coor2xyz,bound2xyzs};