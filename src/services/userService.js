import http from './httpService';
import { NotificationManager } from "react-notifications";
import { apiUrl } from '../config.json';

const apiEndpoint = apiUrl + '/users';

function getUserData() {
  return http.get(`${apiEndpoint}/me`);
}

function register(user) {
  const { street, houseNum, addressExt, zip, city, country } = user;
  let profile = {};
  if (street) profile = { ...profile, street };
  if (houseNum) profile = { ...profile, houseNum };
  if (addressExt) profile = { ...profile, addressExt };
  if (zip) profile = { ...profile, zip };
  if (city) profile = { ...profile, city };
  if (country) profile = { ...profile, country };

  return http.post(apiEndpoint, {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    password: user.password,
    adminPw: user.adminPw,
    profile
  });
}

async function edit(user) {
  // flat user data (without embedded profile -> now eg. user.city)
  let req = await http.patch(`${apiEndpoint}/me`, user);
  NotificationManager.success("", "Nutzerdaten wurden geändert", 5000);
  return req;
}

async function changePassword(data) {
  // data must look like {oldPwd: "ffff", newPwd: "gggg"}
  let req = await http.patch(`${apiEndpoint}/changePwd`, data);
  NotificationManager.success("", "Passwort wurde geändert", 5000);
  return req;
}

export default {
  getUserData,
  register,
  edit,
  changePassword
};
