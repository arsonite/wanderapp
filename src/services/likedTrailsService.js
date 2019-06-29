import http from './httpService';
import { apiUrl } from '../config.json';
import auth from './authService';
import { NotificationManager } from "react-notifications";

let url = '';

function getApiEndpoint() {
  return apiUrl + '/users/' + auth.getCurrentUser()._id + '/likedTrails';
}

function trailUrl(id) {
  return `${getApiEndpoint()}/${id}`;
}

function getLikedTrails() {
  url = getApiEndpoint();
  return this;
}

async function likeTrail(trail) {
  let req = await http.post(getApiEndpoint(), trail);
  NotificationManager.success("", "Route wurde favorisiert", 3000);
  return req
}

async function dislikeTrail(trailId) {
  let req = await http.delete(trailUrl(trailId))
  NotificationManager.success("", "Route wurde entfavorisiert", 3000);
  return req;
}

function withParams() {
  url += '?';
  return this;
}

function expandPois() {
  url += 'expand=pois&';
  return this;
}

function expandRoute() {
  url += 'expand=route&';
  return this;
}

function pageSize(size) {
  url += `pageSize=${size}&`;
  return this;
}

function pageNumber(number) {
  url += `pageNumber=${number}&`;
  return this;
}

function execute() {
  url = url.slice(0, -1);
  return http.get(url);
}

export default {
  getLikedTrails,
  likeTrail,
  dislikeTrail,
  withParams,
  expandPois,
  expandRoute,
  pageSize,
  pageNumber,
  execute
};
