import React from 'react';
import { Map, TileLayer, Polyline} from 'react-leaflet';
import Joi from 'joi-browser';

import Form from '../common/form';
import DifficultySingle from '../common/difficultySingle';
import { NotificationManager } from 'react-notifications';
import trailService from '../../services/trailService';
import surfaceService from '../../services/surfaceService';

import getZoomLevelForTrail from '../../services/zoomLevelService';
import utility from '../../util/distanceUtility';

import { url } from '../../URL.json';

import('./style/submitTrailView.css');

const color = '#3477C5';
const imgURL = window.location.origin + '/img/';

class SubmitTrailView extends Form {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      data: {
        name: '',
        description: '',
        difficulty: -1,
        surfaceIds: [],
        tags: '',
        private: ''
      },
      surfaces: [{ _id: 0, name: '' }],
      private: [
        { _id: 0, value: false, name: 'nein' },
        { _id: 1, value: true, name: 'ja' }
      ],
      errors: {},
      name: [],
      send: false,
      errorMsgDifficulty: ''
    };
  }

  schema = {
    name: Joi.string()
      .min(2)
      .max(64)
      .required()
      .label('Titel'),
    description: Joi.string()
      .allow('')
      .max(500)
      .label('Beschreibung'),
    difficulty: Joi.number().min(1),
    surfaceIds: Joi.array()
      .items(Joi.string())
      .min(1),
    tags: Joi.string()
      .allow('')
      .max(100)
      .label('Tags')
      .replace(/[+,#\-_(){/}.;*\\~'"^]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s$/g, '')
      .replace(/^\s/g, ''),
    private: Joi.label('Nicht veröffentlichen').required()
  };

  componentDidMount() {
    this._isMounted = true;
  }

  async componentWillMount() {
    const { data: surfaces } = await surfaceService.getSurfaces();
    if (this._isMounted) {
      this.setState({ surfaces });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleLocalSubmit = async () => {
    let data = this.state.data;
    data.private = true;
    this.setState({ data });
    this.handleSubmit();
  };

  handlePublicSubmit = async () => {
    let data = this.state.data;
    data.private = false;
    this.setState({ data });
    this.handleSubmit();
  };

  cancelSubmit = () => {
    if (window.confirm('Willst du die Route wirklich verwerfen?')) {
      this.setState({ send: false });
      this.props.history.push({ pathname: url.recordScreen });
    }
  };

  handleSubmit = async () => {
    let data = this.state.data;
    const trail = this.props.location.state.trail;

    let routepoints = trail.routepoints;
    let distance = trail.distance;
    let duration = trail.duration;

    if (data.tags !== '') {
      this.schema.tags.validate(data.tags, (err, value) => {
        if (err) {
          console.log('Error on validation of tags', err);
        } else {
          data.tags = value;
        }
      });
    }

    try {
      let submitData = {
        name: data.name,
        difficulty: data.difficulty,
        distance: distance,
        duration: duration,
        routepoints: routepoints,
        surfaceIds: data.surfaceIds,
        private: data.private
      };
      
      if (data.description) {
        submitData = { ...submitData, description: data.description };
      }
      if (data.tags) submitData = { ...submitData, tags: data.tags };
      console.log('submit', await trailService.saveTrail(submitData));

      this.props.history.push({
        pathname: url.profileScreen
      });
    } catch (err) {
      if (err.message === 'Network Error') {
        NotificationManager.warning(
          '',
          'Es konnte keine Verbindung mit den Server hergestellt werden',
          '7000'
        );
      }
      console.error('bad request: ', err);
    }
  };

  handleTypeChange = e => {
    let data = this.state.data;
    let surfaceIds = [];
    for (let i = 0; i < e.target.options.length; i++)
      if (e.target.options[i].selected)
        surfaceIds.push(e.target.options[i].value);
    data.surfaceIds = surfaceIds;
    const errors = { ...this.state.errors };
    if (surfaceIds.length > 0) delete errors['surfaceIds'];
    this.setState({ errors, data });
  };

  retrieveDifficulty = difficulty => {
    let data = { ...this.state.data };
    data.difficulty = difficulty;
    const errors = { ...this.state.errors };
    delete errors['difficulty'];
    this.setState({ errors, data });
  };

  render() {
    const trail = this.props.location.state.trail;
    if (trail === undefined) return null;

    let distance = trail.distance;
    let duration = trail.duration;

    let latLng = [];
    trail.routepoints.map(rp => {
      latLng.push([rp.latitude, rp.longitude]);
      return rp;
    });
    trail.latLng = latLng;

    let zoomLevel = getZoomLevelForTrail(trail, window.innerWidth, 100);
    let n = Math.floor(trail.latLng.length / 2);
    const position1 = [trail.latLng[n][0], trail.latLng[n][1]];

    return (
      <div id="submitTrail">
        <div id="content">
          <div id="map">
            <Map
              id="submitTrailMap"
              center={position1}
              zoom={zoomLevel}
              zoomControl={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              dragging={false}
            >
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Polyline
                positions={trail.latLng}
                color={color}
                weight={5}
                lineCap={'butt'}
              />
            </Map>
          </div>

          <form>
            <span id="distance" className="bar">
              Strecke: <p>{utility.round2Fixed(distance)} km</p>
            </span>
            <span id="duration" className="bar">
              Dauer: <p>{Math.round(duration)} min</p>
            </span>
            <hr />

            {this.renderInput('name', '* Titel:')}

            <div className="form-group">
              <span>* Schwierigkeit:</span>
              <DifficultySingle pop={this.retrieveDifficulty} />
              {this.state.errors['difficulty'] && (
                <div className="errorMsg">
                  Bitte wähle eine Schwierigkeit aus.
                </div>
              )}
            </div>

            {this.renderInput('tags', 'Schlagwörter / Tags:')}

            {this.renderInput('description', 'Beschreibung:')}

            <span>* Wegtypen:</span>
            <div className="form-group">
              <select
                multiple
                className="form-control form-rounded"
                id="surfaceIds"
                onChange={this.handleTypeChange}
                error={this.state.errors.surfaceIds}
              >            
                {this.state.surfaces.map(option => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {this.state.errors['surfaceIds'] && (
                <div className="errorMsg">
                  Bitte wähle mindestens einen Wegtypen aus.
                </div>
              )}
            </div>
            <span id="necessaryFields">* Pflichtfelder</span>
          </form>
          <div id="lower_bar_placeholder" />
        </div>

        <div id="lower_bar">
          <div className="buttonBox">
            <button className="roundButton" onClick={this.cancelSubmit}>
              <img src={imgURL + 'delete.svg'} alt="" />
            </button>
            <p id="pLowerBar">Verwerfen</p>
          </div>

          <div className="buttonBox">
            <button
              disabled={this.validate()}
              className={`roundButton ${this.validate() ? 'disabled' : ''}`}
              onClick={this.handlePublicSubmit}
            >
              <span
                onClick={
                  this.validate() && this.userTriesToSubmitFormWithErrors
                }
              >
                <img src={`${imgURL}uploaded.svg`} alt="" />
              </span>
            </button>
            <p id="pLowerBar">Route hochladen</p>
          </div>

          <div className="buttonBox">
            <button
              disabled={this.validate()}
              onClick={this.handleLocalSubmit}
              className={`roundButton ${this.validate() ? 'disabled' : ''}`}
            >
              <span
                onClick={
                  this.validate() && this.userTriesToSubmitFormWithErrors
                }
              >
                <img src={`${imgURL}user.svg`} alt="" />
              </span>
            </button>
            <p id="pLowerBar">Privat speichern</p>
          </div>
        </div>
      </div>
    );
  }
}

export default SubmitTrailView;
