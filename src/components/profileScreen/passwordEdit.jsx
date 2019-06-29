import React from "react";
import Joi from "joi-browser";

import Form from "../common/form";

import userService from "../../services/userService";
import { url } from "../../URL.json";

import "./style/passwordEdit.css";

class ProfileEdit extends Form {
  state = {
    data: {
      password_old: "",
      password: "",
      password_confirm: "",
    },
    errors: {},
  };

  schema = {
    password_old: Joi.string()
      .min(5)
      .max(255)
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
      .label("password"),
    password_confirm: Joi.string()
      .min(5)
      .max(255)
      .required()
      .label("password confirm"),
  };

  validatePasswords = () => {
    const {
      password,
      password_confirm: confirm,
      password_old: old,
    } = this.state.data;
    if (password === old) {
      this.setState({
        errors: { password: "Neues Passwort darf nicht dem alten entsprechen" },
      });
      return false;
    }
    if (password !== confirm) {
      this.setState({
        errors: { password_confirm: "Passwörter stimmen nicht überein" },
      });
      return false;
    }
    return true;
  };

  doSubmit = async () => {
    if (!this.validatePasswords()) return;
    try {
      const data = this.state.data;
      const passwordData = {
        oldPwd: data.password_old,
        newPwd: data.password,
      };
      const passwordResponse = await userService.changePassword(passwordData);
      console.log(passwordResponse);
      this.props.history.push(url.profileScreen);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div id="password_edit">
        <form onSubmit={this.handleSubmit}>
          {this.renderInput(
            "password_old",
            "Altes Passwort eingeben",
            "password",
          )}
          {this.renderInput("password", "Neues Passwort", "password")}
          {this.renderInput(
            "password_confirm",
            "Neues Passwort bestätigen",
            "password",
          )}
          {this.renderButton("Speichern")}
        </form>
      </div>
    );
  }
}

export default ProfileEdit;
