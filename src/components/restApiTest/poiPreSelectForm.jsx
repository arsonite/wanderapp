import React from 'react';
import Joi from 'joi-browser';
import Form from '../common/form';

class PoiPreSelectForm extends Form {
  state = {
    data: {
      images: []
    },
    errors: {}
  };

  schema = {
    images: Joi.required().label('Image_File')
  };

  doSubmit = e => {
    e.preventDefault();
    this.props.onSelected(this.state.data.images);
    this.props.history.push('/start/trailForm');
  };

  render() {
    return (
      <div>
        <h1>Wähle POIs, die dann für den Trail-Form zur Verfügung stehen</h1>
        <form onSubmit={this.doSubmit}>
          {this.renderInput('images', 'Bilder', 'file')}
          {this.renderButton('Preselect for Trailform')}
        </form>
      </div>
    );
  }
}

export default PoiPreSelectForm;
