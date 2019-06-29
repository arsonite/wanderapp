import axios from "axios";
import logger from "./logService";
import { NotificationManager } from "react-notifications";

axios.interceptors.response.use(null, error => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    logger.log(error);
    if (error.response) {
      NotificationManager.info("", error.response.data);
    } else {
      NotificationManager.info("", "Error occurred");
    }
  } else {
    console.log("error", error);
    NotificationManager.info("", error.response.data);
  }

  return Promise.reject(error);
});

function setJwt(jwt) {
  //console.log(`Front {  } http ->set x-auth-token: ${jwt}`);
  axios.defaults.headers.common["x-auth-token"] = jwt;
}

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  patch: axios.patch,
  setJwt,
};
