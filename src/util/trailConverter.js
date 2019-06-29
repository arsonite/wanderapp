const _ = require("lodash");

function convertToTrailJSON(trailForm) {
  let trailJSON = { ...trailForm };
  trailJSON.difficulty = 1;
  trailJSON.private =  false;
  trailJSON.routepoints = getRoutepointObjs(trailForm.routepoints);
  trailJSON.surfaceIds = ["5c1822dc04c66041080f011e"];
  return trailJSON;
}

function getRoutepointObjs(routepoints) {
  let routepointObjs = [];
  const pointArray = _.split(routepoints, "]");

  pointArray.forEach(rp => {
    const latLong = rp.match(/\d+\.\d+/g);
    if (latLong && latLong.length !== 0) {
      routepointObjs.push({
        latitude: latLong[0],
        longitude: latLong[1],
        altitude: 53,
        timestamp: Date.now(),
      });
    }
  });
  return routepointObjs;
}

export default {
  convertToTrailJSON
};
