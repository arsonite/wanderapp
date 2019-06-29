import { NotificationManager } from 'react-notifications';

import http from './httpService';
import auth from './authService';

import { apiUrl } from '../config.json';

let url = '';

function getApiEndpoint() {
  return apiUrl + '/users/' + auth.getCurrentUser()._id + '/createdTrails';
}

function trailUrl(id) {
  return `${getApiEndpoint()}/${id}`;
}

function getOwnTrails() {
  url = getApiEndpoint();
  return this;
}

function getLatestOwnTrails() {
  url = getApiEndpoint() + '/latest';
  return this;
}

async function editOwnTrail(trailId, data) {
  let req = await http.patch(`${getApiEndpoint()}/${trailId}`, data);
  NotificationManager.success('', 'Die Route wurde erfolgreich bearbeitet', 5000);
  return req;
}

async function publishOwnTrail(trailId) {
  let req = await http.patch(`${getApiEndpoint()}/${trailId}/publish`);
  NotificationManager.success('', 'Die Route wurde erfolgreich veröffentlicht', 5000);
  return req;
}

async function deleteOwnTrail(trailId) {
  let req = await http.delete(trailUrl(trailId));
  NotificationManager.success('', 'Trail wurde gelöscht', 5000);
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

function onlyPublished() {
  url += 'filter=public&';
  return this;
}

function onlyUnpublished() {
  url += 'filter=private&';
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
  getOwnTrails,
  getLatestOwnTrails,
  editOwnTrail,
  publishOwnTrail,
  deleteOwnTrail,
  withParams,
  expandPois,
  expandRoute,
  onlyPublished,
  onlyUnpublished,
  pageSize,
  pageNumber,
  execute
};
