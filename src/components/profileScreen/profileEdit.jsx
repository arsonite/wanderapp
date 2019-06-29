import React from "react";
import Joi from "joi-browser";

import Form from "../common/form";
import { NotificationManager } from "react-notifications";

import http from "../../services/httpService";
import userService from "../../services/userService";

import { url } from "../../URL.json";
import { apiUrl } from "../../config.json";

const _ = undefined;

class ProfileEdit extends Form {
  state = {
    oldData: {},
    data: {},
    errors: {},
    promiseResolved: false,
  };

  schema = {
    firstname: Joi.string()
      .min(2)
      .max(50)
      .required()
      .label("Firstname"),
    lastname: Joi.string()
      .min(2)
      .max(50)
      .required()
      .label("Lastname"),
    street: Joi.string()
      .allow("")
      .min(2)
      .max(255)
      .label("Street"),
    houseNum: Joi.string()
      .allow("")
      .max(50)
      .label("House number"),
    zip: Joi.string()
      .allow("")
      .min(2)
      .max(255)
      .label("Zip"),
    city: Joi.string()
      .allow("")
      .min(2)
      .max(255)
      .label("City"),
    country: Joi.string()
      .allow("")
      .min(1)
      .max(255)
      .label("Country"),
  };

  validate = () => {
    const data = this.state.data;

    let duplicate = false;
    for (const key in data) {
      if (data[key] === this.state.oldData[key]) {
        duplicate = true;
        continue;
      }
      duplicate = false;
      break;
    }
    if (duplicate) return true;

    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  doSubmit = async () => {
    try {
      const dataResponse = await userService.edit(this.state.data);
      console.log(dataResponse);
      
      this.props.history.push(url.profileScreen);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
      NotificationManager.error("", "Änderungen wurden nicht übernommen", 5000);
    }
  };

  async componentDidMount() {
    let user = await http.get(apiUrl + "/users/me");
    user = user.data;
    const data = {
      firstname: user.firstname,
      lastname: user.lastname,
      street: user.profile.street || "",
      houseNum: user.profile.houseNum || "",
      zip: user.profile.zip || "",
      city: user.profile.city || "",
      country: user.profile.country || "",
    };
    this.setState({ oldData: data, data: data, promiseResolved: true });
  }

  render() {
    if (!this.state.promiseResolved) return null;
    return (
      <div id="profile_edit">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("firstname", "Name", "text", "Vorname")}
          {this.renderInput("lastname", _, "text", "Nachname")}
          {this.renderInput("street", "Adresse", "text", "Straße")}
          {this.renderInput("houseNum", _, "text", "Straßennummer")}
          {this.renderInput("zip", _, "text", "Postleitzahl")}
          {this.renderInput("city", _, "text", "Stadt")}
          {this.renderInput("country", _, "text", "Land")}
          {this.renderButton("Speichern")}
        </form>
      </div>
    );
  }
}

export default ProfileEdit;
