import React, { Component } from 'react';
import Joi from 'joi-browser';
import germanTranslations from '../../locales/de_DE.json';
import Input from './input';
import { NotificationManager } from 'react-notifications';

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };

  trimData() {
    let data = { ...this.state.data };
    for (const key in data) {
      if (typeof data[key] === 'string') data[key] = data[key].trim();
    }
    this.setState({ data });
  }

  validate = () => {
    const options = { abortEarly: false, language: germanTranslations };
    let { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;
    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const options = { language: germanTranslations };
    let { error } = Joi.validate(obj, schema, options);
    return error ? error.details[0].message : null;
  };

  handleSubmit = async e => {
    e.preventDefault();
    await this.trimData();
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;
    this.doSubmit();
  };

  validateGivenInputField = async ({ currentTarget: input }) => {
    await this.trimData();
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];
    this.setState({ errors });
  };

  updateStateWithNewUserInput = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    if (input.files) {
      data[input.name] = input.files;
    } else {
      data[input.name] = input.value;
    }
    this.setState({ data });
  };

  handleChange = inputField => {
    this.validateGivenInputField(inputField);
    this.updateStateWithNewUserInput(inputField);
  };

  userTriesToSubmitFormWithErrors = async e => {
    await this.trimData();
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    NotificationManager.error(
      '',
      'Bitte fülle alle benötigten Felder richtig aus',
      7000
    );
  };

  renderButton(label) {
    return (
      <button disabled={this.validate()} className="btn btn-primary">
        <span onClick={this.validate() && this.userTriesToSubmitFormWithErrors}>
          {label}
        </span>
      </button>
    );
  }

  renderInput(name, label, type = 'text', placeholder) {
    const { data, errors } = this.state;

    return type === 'file' ? (
      <Input
        type={type}
        name={name}
        file={data[name]}
        onChange={this.handleChange}
        error={errors[name]}
        label={label}
        multiple
      />
    ) : (
      <Input
        type={type}
        name={name}
        value={data[name]}
        onBlur={this.validateGivenInputField}
        onChange={this.updateStateWithNewUserInput}
        error={errors[name]}
        placeholder={placeholder}
        label={label}
      />
    );
  }
}

export default Form;
