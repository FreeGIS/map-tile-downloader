const bbox = {
  xmin: -20037508.342789244,
  ymin: -20037508.342789244,
  xmax: 20037508.342789244,
  ymax: 20037508.342789244
}

function getTileByCoors(coor, zoom) {
  // 计算coor与bbox左上角坐标
  const left = bbox.xmin;
  const top = bbox.ymax;
  const _width = coor[0] - left;
  const _height = top - coor[1];
  let worldTileSize = 0x01 << zoom;
  const boundsWidth = bbox.xmax - bbox.xmin;
  const boundsHeight = bbox.ymax - bbox.ymin;
  const tileGeoSize = Math.max(boundsWidth, boundsHeight) * 1.0 / worldTileSize;
  const row = Math.floor(_height / tileGeoSize);
  const column = Math.floor(_width / tileGeoSize);

  return {
    row, column
  }
}


function bound2xyzs(bound, tz) {
  // 使用左上角，右下角，计算瓦片行列号
  const tileinfo1 = getTileByCoors([bound[0], bound[3]], tz);
  const tileinfo2 = getTileByCoors([bound[2], bound[1]], tz);
  // 部分瓦片规则是从下往上，综合判断即可
  const xyz1 = [tileinfo1.column, Math.min(tileinfo1.row, tileinfo2.row), tz];
  const xyz2 = [tileinfo2.column, Math.max(tileinfo1.row, tileinfo2.row), tz];
  return [xyz1, xyz2];
}


module.exports = { bound2xyzs };