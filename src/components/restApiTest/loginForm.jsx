import React from 'react';
import { Redirect } from 'react-router-dom';
import Joi from 'joi-browser';
import Form from '../common/form';
import auth from '../../services/authService';

class LoginForm extends Form {
  state = {
    data: { loginEmail: '', loginPassword: '' },
    errors: {}
  };

  schema = {
    loginEmail: Joi.string()
      .required()
      .label('Email'),
    loginPassword: Joi.string()
      .required()
      .label('Password')
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.loginEmail, data.loginPassword);
      window.location = '/';
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.loginEmail = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    if (auth.userIsSignedIn()) return <Redirect to="/" />;

    return (
      <div className="mt-5">
        <h1>Login</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput('loginEmail', 'Email', 'email')}
          {this.renderInput('loginPassword', 'Password', 'password')}
          {this.renderButton('Login')}
        </form>
      </div>
    );
  }
}

export default LoginForm;
