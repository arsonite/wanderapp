import React from 'react';
import Joi from 'joi-browser';

import Difficulty from '../common/difficulty';
import Rating from '../common/rating';
import Form from '../common/form';

import './style/filterView.css';

const imgURL = window.location.origin + '/img/';

class FilterView extends Form {
  state = {
    data: {
      trailName: '',
      tags: '',
      durationFrom: '',
      durationUntil: '',
      distanceFrom: '',
      distanceUntil: '',
      rating: 0,
      difficulty: [],
      surfaces: []
    },
    errors: {}
  };

  schema = {
    trailName: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .allow('')
      .allow(null),
    tags: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .allow('')
      .allow(null),
    durationFrom: Joi.number()
      .min(0.0)
      .max(10000.0)
      .allow('')
      .allow(null),
    durationUntil: Joi.number()
      .min(0.0)
      .max(10000.0)
      .allow('')
      .allow(null),
    distanceFrom: Joi.number()
      .min(0.0)
      .max(10000.0)
      .allow('')
      .allow(null),
    distanceUntil: Joi.number()
      .min(0.0)
      .max(10000.0)
      .allow('')
      .allow(null),
    rating: Joi.number()
      .max(5)
      .allow(null),
    difficulty: Joi.array()
      .allow(null)
  };

  retrieveRating = rating => {
    let data = this.state.data;
    data.rating = rating;
    this.setState({ data: data });
  };

  retrieveDifficulty = difficulty => {
    let data = this.state.data;
    data.difficulty = difficulty;
    this.setState({ data })
  };

  doSubmit = () => {
    this.props.onSubmit(this.state.data);
  };

  handleTypeChange = e => {
    let data = this.state.data;
    let surfaces = [];
    for (let i = 0; i < e.target.options.length; i++) {
      if (e.target.options[i].selected) {
        surfaces.push(e.target.options[i].value);
      }
    }
    data.surfaces = surfaces;
    this.setState({ data });
  };

  validate = () => {
    let data = this.state.data;
    let disabled = true;
    for (let key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        disabled = false;
      } else if (Array.isArray(data[key])) {
        continue;
      } else if (data[key] === 0) {
        continue;
      } else if (data[key] !== '') {
        disabled = false;
      }
    }
    return disabled;
  };

  render() {
    return (
      <div id="filter" className={this.props.visible ? '' : 'out'}>
        <button id="hideFilter" onClick={this.props.toggle}>
          <img className="backImg" src={`${imgURL}backarrow.svg`} alt="" />
        </button>

        <form onSubmit={this.doSubmit}>
          {this.renderInput('trailName', 'Nach Titel suchen')}
          {this.renderInput('tags', 'Nach Schlagwörtern suchen')}

          <div className="frame">
            <span>Strecke begrenzen (km)</span>
            <div>
              {this.renderInput('distanceFrom')}
              <p>bis</p>
              {this.renderInput('distanceUntil')}
            </div>
          </div>
          <div className="frame">
            <span>Dauer begrenzen (min)</span>
            <div>
              {this.renderInput('durationFrom')}
              <p>bis</p>
              {this.renderInput('durationUntil')}
            </div>
          </div>

          <span>Bewertung eingrenzen</span>
          <Rating editable={true} filter={true} pop={this.retrieveRating} />

          <span>Schwierigkeit eingrenzen</span>
          <Difficulty filter={true} pop={this.retrieveDifficulty} />

          <span>Wegtypen eingrenzen</span>
          <select
            multiple
            className="form-control form-rounded"
            id="surfaceType"
            onChange={this.handleTypeChange}
          >
            {this.props.surfaces.map(option => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </select>

          <button
            id="applyFilter"
            type="button"
            onClick={this.doSubmit}
            disabled={this.validate()}
            className={`roundButton ${this.validate() ? 'disabled' : ''}`}
          >
            <img id="searchImg" src={`${imgURL}/nav/s_search.svg`} alt="" />
          </button>
        </form>
      </div>
    );
  }
}

export default FilterView;
