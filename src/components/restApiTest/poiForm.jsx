import React from 'react';
import Joi from 'joi-browser';
import Form from '../common/form';
import poiService from '../../services/poiService';

class PoiForm extends Form {
  state = {
    data: {
      description: '',
      images: []
    },
    errors: {}
  };

  schema = {
    description: Joi.string()
      .max(5000)
      .required()
      .label('Beschreibung'),
    images: Joi.required().label('Bilderdateien')
  };

  doSubmit = async () => {
    console.log('wurde gesendet1!');
    try {
      await poiService.savePoi(this.state.data);
      this.props.history.push('/start/pois');
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.loginEmail = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div>
        <h1>Poi Form</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput('description', 'Beschreibung')}
          {this.renderInput('images', 'Bilder', 'file')}
          {this.renderButton('Upload')}
        </form>
      </div>
    );
  }
}

export default PoiForm;
