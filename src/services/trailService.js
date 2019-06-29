import trailConverter from '../util/trailConverter';

import http from './httpService';
import { NotificationManager } from "react-notifications";

import { apiUrl } from '../config.json';

const apiEndpoint = apiUrl + '/trails';

let url = '';

function trailUrl(id) {
  return `${apiEndpoint}/${id}`;
}

function getTrails() {
  url = apiEndpoint;
  return this;
}

function getBestTrails() {
  url = apiEndpoint + '/bestTrails';
  return this;
}

function getLatestTrails() {
  url = apiEndpoint + '/latest';
  return this;
}

function getTrail(trailId) {
  return http.get(trailUrl(trailId));
}

async function getNumbersOfTrails() {
  let req = await http.get(apiEndpoint + '/numbersOfTrails');
  return req.data.numbersOfTrails;
}

async function rateTrail(stars, trailId) {
  let req = await http.patch(apiEndpoint + '/' + trailId + '/rating', { stars });
  NotificationManager.success('', 'Bewertung wurde abgegeben', 5000);
  return req;
}

async function saveTrail(trail) {
  let req = await http.post(apiEndpoint, trail);
  NotificationManager.success('', 'Route wurde hochgeladen', 5000);
  return req;
}

function saveTrailJustForApiTest(trail) {
  return http.post(apiEndpoint, trailConverter.convertToTrailJSON(trail));
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

function searchForTrailName(trailNameTerm) {
  if (trailNameTerm) url += `trailName=${trailNameTerm}&`;
  return this;
}

function searchInTags(trailTagsTerm) {
  if (trailTagsTerm) url += `trailTags=${trailTagsTerm}&`;
  return this;
}

function durationFrom(minDuration) {
  if (minDuration) url += `duraFrom=${minDuration}&`;
  return this;
}

function durationUntil(maxDuration) {
  if (maxDuration) url += `duraUntil=${maxDuration}&`;
  return this;
}

function distanceFrom(minDistance) {
  if (minDistance) url += `distFrom=${minDistance}&`;
  return this;
}

function distanceUntil(maxDistance) {
  if (maxDistance) url += `distUntil=${maxDistance}&`;
  return this;
}

function minStars(minStars) {
  if (minStars) url += `stars=${minStars}&`;
  return this;
}

function includeDifficulty(difficulty) {
  if (difficulty) {
    for (let i = 0; i < difficulty.length; i++) {
      if (difficulty[i] === undefined) {
        continue;
      }
      url += `trailDifficulty=${difficulty[i]}&`;
    }
  }
  return this;
}

function includeSurface(surface) {
  if (surface) {
    for (let i = 0; i < surface.length; i++) {
      url += `trailSurface=${surface[i]}&`;
    }
  }
  return this;
}

function execute() {
  url = url.slice(0, -1);
  return http.get(url);
}

export default {
  getTrails,
  getTrail,
  getNumbersOfTrails,
  getBestTrails,
  getLatestTrails,
  saveTrail,
  rateTrail,
  withParams,
  expandPois,
  expandRoute,
  pageSize,
  pageNumber,
  searchForTrailName,
  searchInTags,
  durationFrom,
  durationUntil,
  distanceFrom,
  distanceUntil,
  minStars,
  includeDifficulty,
  includeSurface,
  execute,
  saveTrailJustForApiTest
};
