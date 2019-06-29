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

function round2Fixed(value) {
  value = +value;

  if (isNaN(value)) return NaN;

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] + 2 : 2)));

  // Shift back
  value = value.toString().split('e');
  return (+(value[0] + 'e' + (value[1] ? +value[1] - 2 : -2))).toFixed(2);
}

//source : https://stackoverflow.com/questions/31790344/determine-if-a-point-reside-inside-a-leaflet-polygon, author gusper
function isMarkerInsidePolygon(marker, poly) {
  var polyPoints = poly;
  var x = marker[0],
    y = marker[1];

  var inside = false;
  for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
    var xi = polyPoints[i][1],
      yi = polyPoints[i][0];
    var xj = polyPoints[j][1],
      yj = polyPoints[j][0];

    var intersect =
        (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function addCircleRadiusToTrails(trails) {
    for (var i = 0; i < trails.length; i++) {
        if (trails[i].distance > 1) {
            trails[i].circleRadius = 70;
        } else {
            trails[i].circleRadius = 20;
        }
    }
}

function getCentroid(arr) {
    var twoTimesSignedArea = 0;
    var cxTimes6SignedArea = 0;
    var cyTimes6SignedArea = 0;

    var length = arr.length

    var x = function (i) { return arr[i % length][0] };
    var y = function (i) { return arr[i % length][1] };

    for ( var i = 0; i < arr.length; i++) {
        var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
        twoTimesSignedArea += twoSA;
        cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
        cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
    }
    var sixSignedArea = 3 * twoTimesSignedArea;
    return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];
}

export default {
  getDistanceBetweenTwoPoints,
  isMarkerInsidePolygon,
  round2Fixed,
  addCircleRadiusToTrails,
    getCentroid
};
