import React from 'react';
import { Map, TileLayer, Polyline } from 'react-leaflet';
import Joi from 'joi-browser';
import { NotificationManager } from 'react-notifications';

import Form from '../common/form';
import Rating from '../common/rating';
import FilterButton from '../common/filterButton';

import authService from '../../services/authService';
import likedTrailsService from '../../services/likedTrailsService';
import ownTrailsService from '../../services/ownTrailsService';
import getZoomLevelForTrail from '../../services/zoomLevelService';

import utility from '../../util/distanceUtility';

import { url } from '../../URL.json';

import './style/detailView.css';

const imgURL = window.location.origin + '/img/';
const difficulties = ['Einfach', 'Mittel', 'Schwierig'];

class DetailView extends Form {
  state = {
    data: {
      name: '',
      description: '',
      tags: ''
    },
    oldData: {},
    errors: {},
    name: [],
    key: 'added',
    selected: false
  };

  schema = {
    name: Joi.string()
      .min(2)
      .max(64)
      .label('Name'),
    description: Joi.string()
      .min(2)
      .max(500)
      .label('Beschreibung'),
    tags: Joi.string()
      .min(2)
      .max(100)
      .label('Tags')
      .replace(/[+,#\-_(){/}.;*\\~'"^]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s$/g, '')
      .replace(/^\s/g, '')
  };

  _isMounted = false;

  publishTrail = async () => {
    try {
      console.log(
        'make public',
        await ownTrailsService.publishOwnTrail(this.props.trail._id)
      );
      this.props.editFinished();
      this.props.history.push(url.profileScreen);
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

  async componentDidMount() {
    this._isMounted = true;
    if (this.props.id < 0) {
      if (this.props.parentUrl.includes('/search')) {
        this.props.history.push(url.mapView);
      } else if (this.props.parentUrl.includes('/list')) {
        this.props.history.push(url.listScreen);
      } else if (this.props.parentUrl.includes('/profile')) {
        this.props.history.push(url.profileScreen);
      }
    }

    if (!this._isMounted) {
      return;
    }
    let likedTrails = await likedTrailsService
      .getLikedTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .execute();
    likedTrails = likedTrails.data;
    let selected = false;
    likedTrails.forEach(likedTrail => {
      if (likedTrail._id === this.props.trail._id) {
        selected = true;
      }
    });
    this.setState({ selected: selected });

    if (!this.props.edit) {
      return;
    }
    const trail = this.props.trail;
    let tags = '';
    trail.tags.forEach(tag => {
      tags += tag + ' ';
    });
    tags = tags.substring(0, tags.length - 1);

    let data = {
      name: trail.name,
      description: trail.description,
      tags: tags
    };
    this.setState({
      data: data,
      oldData: data
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  showUsername() {
    let trail = this.props.trail;
    if (trail.user === undefined) {
      return null;
    } else {
      return (
        <span id="user" className="bar">
          von Nutzer
          <p>{trail.user.firstname}</p>
        </span>
      );
    }
  }

  toggle = () => {
    let selected = !this.state.selected;
    this.setState({ selected: selected }, () => {
      this.likeTrail(selected);
      if (this.props.favourizeFinished === undefined) return;
      this.props.favourizeFinished();
    });
  };

  likeTrail = async liked => {
    let trail = { trailId: this.props.trail._id };
    try {
      if (liked) {
        await likedTrailsService.likeTrail(trail);
        return;
      }
      await likedTrailsService.dislikeTrail(trail.trailId);
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

  isOwnTrail = () => {
    if (
      this.props.trail.user === undefined ||
      this.props.trail.user._id === authService.getCurrentUser()._id
    ) {
      return;
    }

    const key = this.state.key;
    return (
      <div className="buttonBox">
        <FilterButton
          key={key}
          id={`filter_${key}`}
          src={`${key}.svg`}
          selected={this.state.selected}
          toggle={this.toggle}
        />
        <p id="pLowerBar">Route favourisieren</p>
      </div>
    );
  };

  cancelSubmit = () => {
    if (window.confirm('Bisherige Änderungen werden verworfen.')) {
      this.props.history.push(url.profileScreen);
    }
  };

  doSubmit = async () => {
    let data = this.state.data;

    this.schema.tags.validate(data.tags, (err, value) => {
      if (err) {
        console.log('Error on validation of tags', err);
      } else {
        data.tags = value;
      }
    });
    try {
      console.log(
        'submit',
        await ownTrailsService.editOwnTrail(this.props.trail._id, data)
      );
      this.props.editFinished();
      this.props.history.push(url.profileScreen);
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

  validate = () => {
    const data = this.state.data;

    let duplicate = false;
    for (const key in data) {
      if (data[key] === this.state.oldData[key]) {
        duplicate = true;
        continue;
      }
      duplicate = false;
      break;
    }
    if (duplicate) return true;

    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  getComponents = (edit, trail) => {
    if (edit === true) {
      return (
        <form onSubmit={this.handleSubmit}>
          {this.renderInput('name', 'Titel:')}
          {this.renderInput('tags', 'Tags:')}
          {this.renderInput('description', 'Beschreibung:')}
        </form>
      );
    }

    return (
      <div id="components">
        {this.showUsername()}
        <span id="distance" className="bar">
          Strecke:
          <p>{utility.round2Fixed(trail.distance)} km</p>
        </span>

        <span id="duration" className="bar">
          Dauer:
          <p>{utility.round2Fixed(trail.duration / 60)} h</p>
        </span>

        <span id="difficulty" className="bar">
          Schwierigkeit:
          <p>{difficulties[trail.difficulty - 1]}</p>
        </span>

        <div id="rating" className="frame">
          <span>
            Bewertungen (
            {trail.rating !== undefined ? trail.rating.counter : '/'}
            ):
          </span>
          <Rating
            editable={false}
            value={trail.rating !== undefined ? trail.rating.stars : 0}
          />
        </div>

        <div
          id="tags"
          className={`frame${trail.tags[0] === '' ? ' hidden' : ''}`}
        >
          <span>Schlagwörter zur Route:</span>
          <div id="tagsBox">
            {trail.tags.map(tag => {
              return (
                <div
                  key={Math.random() * 1000}
                  className="form-control form-rounded"
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </div>

        <div id="surfaces" className="frame">
          <span>Wegtypen:</span>
          <div id="surfacesBox">
            {trail.surfaces.map(surface => {
              return (
                <div
                  key={Math.random() * 1000}
                  className="form-control form-rounded"
                >
                  {surface.name}
                </div>
              );
            })}
          </div>
        </div>

        <div
          id="description"
          className={`frame${trail.description === undefined ? ' hidden' : ''}`}
        >
          <span>Beschreibung:</span>
          <div className="form-control form-rounded">{trail.description}</div>
        </div>
      </div>
    );
  };

  render() {
    const trail = this.props.trail;
    if (trail.name === undefined) {
      return null;
    }
    let zoomLevel = getZoomLevelForTrail(trail, window.innerWidth, 100);
    let n = Math.floor(trail.latLng.length / 2);
    const position1 = [trail.latLng[n][0], trail.latLng[n][1]];

    const edit = this.props.edit === true;

    return (
      <React.Fragment>
        <div id="details">
          <div id="content">
            <div id="map">
              <Map
                id="detailsMap"
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
                  color={trail.color}
                  weight={5}
                  lineCap={'butt'}
                />
              </Map>
            </div>

            <button
              onClick={edit ? this.cancelSubmit : this.props.backToAll}
              className="backButton"
            >
              <img src={`${imgURL}backarrow.svg`} alt="" />
            </button>

            <span id="titleBox" className={edit ? 'hidden' : ''}>
              <p id="title">{trail.name}</p>
            </span>

            <div
              className={`privateWarning${
                this.props.trail.private ? '' : ' hidden'
              }`}
            >
              <p>
                <b>Diese Route ist privat!</b> Andere Nutzer können sie nicht
                sehen.
              </p>
            </div>

            {this.getComponents(this.props.edit, trail)}
            <div id="lower_bar_placeholder" />
          </div>

          <div id="lower_bar">
            {this.isOwnTrail()}

            <div
              className={`buttonBox ${
                this.props.trail.private && !this.props.edit ? '' : 'hidden'
              }`}
            >
              <button className="roundButton" onClick={this.publishTrail}>
                <img src={imgURL + 'uploaded.svg'} alt="" />
              </button>
              <p id="pLowerBar">{edit ? '' : 'Route veröffentlichen'}</p>
            </div>

            <div className="buttonBox">
              <button
                className={`roundButton${
                  edit ? (this.validate() ? ' disabled' : '') : ''
                }`}
                onClick={
                  edit
                    ? () => this.doSubmit()
                    : () => this.props.toWalk(trail._id)
                }
                disabled={edit ? this.validate() : ''}
              >
                <img
                  src={imgURL + (edit ? 'save.svg' : 'man_walking.svg')}
                  alt=""
                />
              </button>
              <p id="pLowerBar">
                {edit ? 'Änderungen speichern' : 'Route wandern'}
              </p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
DetailView.propTypes = {};

export default DetailView;
