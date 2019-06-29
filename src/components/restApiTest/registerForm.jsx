import React from 'react';
import Joi from 'joi-browser';
import Form from '../common/form';
import userService from '../../services/userService';
import auth from '../../services/authService';

class RegisterForm extends Form {
  state = {
    data: {
      firstname: '',
      lastname: '',
      email: '',
      password: ''
      // adminPw: "",
      // street: "",
      // houseNum: "",
      // addressExt: "",
      // zip: "",
      // city: "",
      // country: ""
    },
    errors: {}
  };

  schema = {
    firstname: Joi.string()
      .min(2)
      .max(50)
      .required()
      .label('Firstname'),
    lastname: Joi.string()
      .min(2)
      .max(50)
      .required()
      .label('Lastname'),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email()
      .label('Email'),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
      .label('Password')
    // adminPw: Joi.string()
    //   .min(5)
    //   .max(255)
    //   .label("Admin Password"),
    // street: Joi.string()
    //   .min(2)
    //   .max(255)
    //   .label("Street"),
    // houseNum: Joi.string()
    //   .max(50)
    //   .label("House number"),
    // addressExt: Joi.string()
    //   .max(255)
    //   .label("Address extention"),
    // zip: Joi.string()
    //   .min(2)
    //   .max(255)
    //   .label("Zip"),
    // city: Joi.string()
    //   .min(2)
    //   .max(255)
    //   .label("City"),
    // country: Joi.string()
    //   .min(1)
    //   .max(255)
    //   .label("Country")
  };

  doSubmit = async () => {
    try {
      const response = await userService.register(this.state.data);
      auth.loginWithJwt(response.headers['x-auth-token']);
      window.location = '/';
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
      <div>
        <h1>Register</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput('firstname', 'Firstname')}
          {this.renderInput('lastname', 'Lastname')}
          {this.renderInput('email', 'Email', 'email')}
          {this.renderInput('password', 'Password', 'password')}
          {/* {this.renderInput("adminPw", "Admin Password", "password")}
          {this.renderInput("street", "Street")}
          {this.renderInput("houseNum", "House number")}
          {this.renderInput("addressExt", "Address extention")}
          {this.renderInput("zip", "Zip")}
          {this.renderInput("city", "City")}
          {this.renderInput("country", "Country")} */}
          {this.renderButton('Register')}
        </form>
      </div>
    );
  }
}

export default RegisterForm;
