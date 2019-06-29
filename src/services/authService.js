import jwtDecode from 'jwt-decode';
import http from './httpService';

import { apiUrl } from '../config.json';

//const moment = require('moment');

const apiEndpoint = apiUrl + '/login';
const tokenKey = 'token';

http.setJwt(getJwt());

async function login(email, password) {
  //console.log(`Front {  } login ->email: ${email}`);
  const { data: jwt } = await http.post(apiEndpoint, { email, password });
  /*console.log(
    `Front { ${moment().format(
      'DD.MM.YY - HH:mm:ss'
    )} } login received jwt ${jwt}`
  );
  console.log(
    `Front { ${moment().format(
      'DD.MM.YY - HH:mm:ss'
    )} } login jwt decoded ${JSON.stringify(jwtDecode(jwt))}`
  );*/
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(getJwt());
  /*console.log(
    `Front { ${moment().format(
      'DD.MM.YY - HH:mm:ss'
    )} } login set jwt + httpTokenSet ${localStorage.getItem(tokenKey)}`
  );*/
}

function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(getJwt());
}

function logout() {
  localStorage.removeItem(tokenKey);
}

function getCurrentUser() {
  try {
    const jwt = localStorage.getItem(tokenKey);
    /*console.log(
      `Front { ${moment().format(
        'DD.MM.YY - HH:mm:ss'
      )} } getUser jwt from localStorage ${jwt}`
    );
    console.log(
      `Front { ${moment().format(
        'DD.MM.YY - HH:mm:ss'
      )} } getUser jwt decoded ${JSON.stringify(jwtDecode(jwt))}`
    );*/
    return jwtDecode(jwt);
  } catch (ex) {
    return null;
  }
}

function getJwt() {
  return localStorage.getItem(tokenKey);
}

function userIsSignedIn() {
  return this.getCurrentUser() !== null;
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
  userIsSignedIn
};
