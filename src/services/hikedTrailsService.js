import http from './httpService';
import { apiUrl } from '../config.json';
import auth from './authService';
import { NotificationManager } from "react-notifications";

let url = '';

function getApiEndpoint() {
  return apiUrl + '/users/' + auth.getCurrentUser()._id + '/hikedTrails';
}

function getHikedTrails() {
  url = getApiEndpoint();
  return this;
}

async function saveHikedTrail(hikedTrail) {
  let req = await http.post(getApiEndpoint(), hikedTrail);
  NotificationManager.success("", "Abgelaufene Route wurde hinzugefügt", 5000);
  return req;
}

function withParams() {
  url += '?';
  return this;
}

function expandTrail() {
  url += 'expand=trail&';
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
  console.log(url);
  url = url.slice(0, -1);
  return http.get(url);
}

export default {
  getHikedTrails,
  saveHikedTrail,
  withParams,
  expandTrail,
  expandRoute,
  pageSize,
  pageNumber,
  execute
};
