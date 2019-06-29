function getZoomLevelForTrail(trail, mapWidth, mapHeight) {
  let sortedLat = sortLatLngs(trail.latLng, 0);
  let sortedLng = sortLatLngs(trail.latLng, 1);
  let minLat = sortedLat[0];
  let maxLat = sortedLat[sortedLat.length - 1];
  let minLng = sortedLng[0];
  let maxLng = sortedLng[sortedLat.length - 1];
  let maxLatPoint = trail.latLng.filter(l => l[0] === maxLat);
  let minLatPoint = trail.latLng.filter(l => l[0] === minLat);
  let maxLngPoint = trail.latLng.filter(l => l[1] === maxLng);
  let minLngPoint = trail.latLng.filter(l => l[1] === minLng);
  let verticalDist =
    getDistanceBetweenTwoPoints(minLatPoint[0], maxLatPoint[0]) * 1000;
  let horizontalDist =
    getDistanceBetweenTwoPoints(minLngPoint[0], maxLngPoint[0]) * 1000;
  let width = mapWidth;
  let height = mapHeight;
  let vd = verticalDist;
  let hd = horizontalDist;
  return chooseZoomLevel(vd, hd, height, width);
}

function sortLatLngs(array, identifier) {
  var sorted = [];
  for (var i = 0; i < array.length; i++) {
    sorted.push(array[i][identifier]);
  }
  sorted.sort((a, b) => {
    return a - b;
  });

  return sorted;
}

function getDistanceBetweenTwoPoints(point1, point2) {
  let earthRadius = 6371;
  let deg2rad = n => {
    return n * (Math.PI / 180);
  };

  let dLat = deg2rad(point2[0] - point1[0]);
  let dLon = deg2rad(point2[1] - point1[1]);

  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1[0])) *
      Math.cos(deg2rad(point2[0])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.asin(Math.sqrt(a));
  let d = earthRadius * c;

  return d;
}

function metresPerPixel(zoom) {
  return (
    (40075016.686 * Math.abs(Math.cos((52.405 * 180) / Math.PI))) /
    Math.pow(2, zoom + 8)
  );
}

function chooseZoomLevel(vd, hd, pixelh, pixelw) {
  return vd > pixelh * metresPerPixel(12) || hd > pixelw * metresPerPixel(12)
    ? 12
    : vd > pixelh * metresPerPixel(13) || hd > pixelw * metresPerPixel(13)
    ? 13
    : vd > pixelh * metresPerPixel(14) || hd > pixelw * metresPerPixel(14)
    ? 14
    : vd > pixelh * metresPerPixel(15) || hd > pixelw * metresPerPixel(15)
    ? 15
    : vd > pixelh * metresPerPixel(16) || hd > pixelw * metresPerPixel(16)
    ? 16
    : vd > pixelh * metresPerPixel(17) || hd > pixelw * metresPerPixel(17)
    ? 16
    : 17;
}

export default getZoomLevelForTrail;
