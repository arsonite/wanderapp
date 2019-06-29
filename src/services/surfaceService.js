import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/surfaces";

function surfaceUrl(id) {
  return `${apiEndpoint}/${id}`;
}

function getSurfaces() {
  return http.get(apiEndpoint);
}

function getSurface(trailId) {
  return http.get(surfaceUrl(trailId));
}

export default {
  getSurfaces,
  getSurface
};
