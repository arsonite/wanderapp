import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/pois";

function poiUrl(id) {
  return `${apiEndpoint}/${id}`;
}

function getPois() {
  return http.get(apiEndpoint);
}

function getPoi(poiId) {
  return http.get(poiUrl(poiId));
}

function savePoi(poi) {
  let bodyFormData = new FormData();
  bodyFormData.set("description", poi.description);
  bodyFormData.set("latitude", poi.latitude);
  bodyFormData.set("longitude", poi.longitude);
  if(poi.altitude) bodyFormData.set("altitude", poi.altitude);
  bodyFormData.set("trailId", poi.trailId);
  Object.keys(poi.images).forEach(key => {
    bodyFormData.append('images', poi.images[key]);
  });
  return http.post(apiEndpoint, bodyFormData);
}

async function addPicturesToPOI(poiId, images, description) {
  let bodyFormData = new FormData();
  if(description) bodyFormData.set("description", description);
  Object.keys(images).forEach(key => {
    bodyFormData.append('images', images[key]);
  });
  return http.patch(apiEndpoint + "/" + poiId, bodyFormData);
}

function deletePoi(poiId) {
  return http.delete(poiUrl(poiId));
}

export default {
  getPois,
  getPoi,
  savePoi,
  deletePoi,
  addPicturesToPOI
};
