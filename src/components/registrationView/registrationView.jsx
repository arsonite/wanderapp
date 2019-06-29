import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import Joi from 'joi-browser';

import Form from '../common/form';

import auth from '../../services/authService';
import userService from '../../services/userService';

import { url } from './../../URL.json';

import './style/registrationView.css';

const _ = undefined;

class RegistrationView extends Form {
  state = {
    data: {
      firstname: '',
      lastname: '',
      email: '',
      street: '',
      houseNum: '',
      zip: '',
      city: '',
      country: ''
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
      .email({ minDomainAtoms: 2 })
      .label('Email'),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
      .label('Password'),
    street: Joi.string()
      .allow('')
      .min(2)
      .max(255)
      .label('Street'),
    houseNum: Joi.string()
      .allow('')
      .max(50)
      .label('House number'),
    zip: Joi.string()
      .allow('')
      .min(2)
      .max(255)
      .label('Zip'),
    city: Joi.string()
      .allow('')
      .min(2)
      .max(255)
      .label('City'),
    country: Joi.string()
      .allow('')
      .min(1)
      .max(255)
      .label('Country')
  };

  doSubmit = async () => {
    try {
      const response = await userService.register(this.state.data);
      auth.loginWithJwt(response.headers['x-auth-token']);
      this.props.history.replace(url.tutorialView);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    if (auth.userIsSignedIn()) return <Redirect to={url.profileScreen} />;
    return (
      <div id="registration">
        <Link id="back" to={url.loginView}>
          {'< Zurück'}
        </Link>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput('email', _, 'text', 'E-Mail-Adresse *')}
          {this.renderInput('password', _, 'password', 'Passwort *')}
          <hr />
          {this.renderInput('firstname', _, 'text', 'Vorname *')}
          {this.renderInput('lastname', _, 'text', 'Nachname *')}
          {this.renderInput('street', _, 'text', 'Straße')}
          {this.renderInput('houseNum', _, 'text', 'Hausnummer')}
          {this.renderInput('zip', _, 'text', 'Postleitzahl')}
          {this.renderInput('city', _, 'text', 'Stadt')}
          {this.renderInput('country', _, 'text', 'Land')}
          <p>* Pflichtfelder</p>
          {this.renderButton('Registrieren')}
        </form>
      </div>
    );
  }
}

export default RegistrationView;
