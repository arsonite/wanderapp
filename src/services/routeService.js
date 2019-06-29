/**
 * Uses an Array of navigator.geoloaction.Position Objects to
 * calculate the overall distance in km
 * @param {Array} positions
 * @returns {Number} distance in km
 */
export function getDistance(positions) {
  let distance = 0;
  for (let i = 1; i < positions.length; i++) {
    distance += distanceInKmBetweenEarthCoordinates(
      positions[i - 1].coords.latitude,
      positions[i - 1].coords.longitude,
      positions[i].coords.latitude,
      positions[i].coords.longitude
    );
  }
  return distance;
}

/**
 * @param {Array} positions
 * @returns {Array} Retuns Routepoints in format of {lat: latArry, lng: lngArray}
 */
export function getRoutepoints(positions) {
  let lat = [];
  let lng = [];
  positions.forEach(pos => {
    lat = [...lat, pos.coords.latitude];
    lng = [...lng, pos.coords.longitude];
  });
  return { latitude: lat, longitude: lng };
}

/**
 * distance (km) / walking-speed-duration (km/h) = time (h)
 * assuming a walking speed of 5 km/h
 * @param {Number} distance in km
 * @returns {Number} duration in min
 */
export function getTimeInMinutes(distance) {
  return (distance / 5) * 60;
}

// --- silly math stuff ---

//https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;
  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);
  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}
