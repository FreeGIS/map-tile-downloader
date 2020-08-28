//xyz转瓦片地理范围
function xyz2bound(z,x,y){
	const minx=x/Math.pow(2,z)*360-180;
	const maxx=(x+1)/Math.pow(2,z)*360-180;
	const n1=Math.PI-2*Math.PI*(y+1)/Math.pow(2,z);
	const n2=Math.PI-2*Math.PI*y/Math.pow(2,z);
	const miny=180/Math.PI*Math.atan(0.5*(Math.exp(n1)-Math.exp(-n1)));
	const maxy=180/Math.PI*Math.atan(0.5*(Math.exp(n2)-Math.exp(-n2)));
	console.log([minx,miny,maxx,maxy]);
	return [minx,miny,maxx,maxy];
}
//地理坐标转xyz
function coor2xyz(coor,z){
	const x=Math.floor((coor[0]+180)/360*Math.pow(2,z));
	const y=Math.floor((1-Math.log(Math.tan(coor[1]*Math.PI/180) + 1/Math.cos(coor[1]*Math.PI/180))/Math.PI)/2 *Math.pow(2,z)); 
	return [z,x,y];
}
//地理边界转xyz范围
function bound2xyzs(bound,z){
	const xyz1=coor2xyz([bound[0],bound[3]],z);
	const xyz2=coor2xyz([bound[2],bound[1]],z);
	return [xyz1,xyz2];
}

module.exports = {xyz2bound,bound2xyzs};