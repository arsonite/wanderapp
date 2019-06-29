import React from 'react';
import { Link } from 'react-router-dom';
import Joi from 'joi-browser';

import Form from '../common/form';

import auth from '../../services/authService';

import { url } from '../../URL.json';

import './style/loginView.css';

const _ = undefined;

class LoginView extends Form {
  state = {
    data: {
      loginEmail: '',
      loginPassword: ''
    },
    errors: {}
  };

  schema = {
    loginEmail: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({ minDomainAtoms: 2 })
      .label('Email'),
    loginPassword: Joi.string()
      .min(5)
      .max(255)
      .required()
      .label('Password')
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.loginEmail, data.loginPassword);
      this.props.history.replace(url.profileScreen);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.loginEmail = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    if (auth.userIsSignedIn()) this.props.history.push(url.profileScreen);
    return (
      <div id="login">
        <h1 className="h1_Logo">
          Wander<span>App</span>
        </h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput('loginEmail', _, 'text', 'E-Mail-Adresse')}
          {this.renderInput('loginPassword', _, 'password', 'Passwort')}
          {this.renderButton('Anmelden')}
        </form>
        <div className="registerBtn">
          <p>oder</p>
          <Link to={url.registrationView}>{'> Registrieren <'}</Link>
        </div>
      </div>
    );
  }
}

export default LoginView;
