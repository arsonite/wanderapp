import React, { Component } from 'react';
import { Map, TileLayer, Marker, Polyline, Circle } from 'react-leaflet';
import { NotificationManager } from 'react-notifications';
import L from 'leaflet';
import Joi from 'joi-browser';

import Rating from '../../common/rating';

import trailService from '../../../services/trailService';

import utility from '../../../util/distanceUtility';

import { url } from '../../../URL';

import './style/arriveAtGoal.css';

const imgURL = window.location.origin + '/img/';
let countNumber;

var greenIcon = L.icon({
  iconUrl: imgURL + 'location_marker.svg',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65]
});

export default class ArriveAtGoal extends Component {
  constructor(props) {
    super(props);
    if (this.props.details.routeID < 0) {
      if (this.props.URL.includes('search')) {
        this.props.history.push(url.mapView);
      } else if (this.props.URL.includes('list')) {
        this.props.history.push(url.listScreen);
      }
    }
    this.state = {
      data: {
        rating: null
      }
    };

    this.schema = {
      rating: Joi.number()
        .max(5)
        .allow(null)
    };
  }

  returnToPositionScreen = () => {
    this.props.history.go(-4);
  };

  componentDidMount() {
    let map = this.refs.myMap.leafletElement;
    this.props.line.addTo(map);
  }

  getEndPoint() {
    var start = this.props.startP;
    var trailStart = this.props.trail.latLng[0];
    var trailEnd = this.props.trail.latLng[this.props.trail.latLng.length - 1];
    if (JSON.stringify(start) === JSON.stringify(trailStart)) {
      return trailEnd;
    } else {
      return trailStart;
    }
  }

  retrieveRating = rating => {
    let data = this.state.data;
    data.rating = rating;
    this.setState({ data: data });
    if (this.state.data !== null) {
      let myButton = document.getElementById('rate');
      myButton.className = 'roundButton';
    }
  };

  async handleClickRatingButton() {
    let trail_ = this.props.trail;
    const ratedStars = this.state.data.rating;
    if (ratedStars === null) {
      return;
    }
    try {
      await trailService.rateTrail(ratedStars, trail_._id);
      this.props.updateT(trail_._id);
      this.returnToPositionScreen();
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
  }

  ratingCounter() {
    let trail = this.props.trail;
    if (trail.rating === undefined) {
      countNumber = 0;
      return countNumber;
    } else {
      countNumber = trail.rating.counter;
      return countNumber;
    }
  }

  render() {
    if (this.props.details.routeID < 0) {
      return null;
    }
    this.props.line.bringToFront();
    const position = [this.props.marker.lat, this.props.marker.lng];
    const trail = this.props.trail;
    const positionNow = this.getEndPoint();

    return (
      <div id="arriveAtGoal">
        <div id="content">
          <div id="map">
            <Map
              id="arriveAtGoalMap"
              ref="myMap"
              center={positionNow}
              zoom={15}
              zoomControl={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
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
              <Circle
                key={Math.random()}
                center={positionNow}
                radius={this.props.distanceRadius}
              />
              <Marker position={position} />
              <Marker
                key={Math.random() * 10}
                icon={greenIcon}
                position={trail.latLng[0]}
              />
              <Marker
                key={Math.random() * 1000}
                icon={greenIcon}
                position={trail.latLng[trail.latLng.length - 1]}
              />
            </Map>
          </div>

          <button
            id="backToAll"
            onClick={this.returnToPositionScreen}
            className="backButton"
          >
            <img src={`${imgURL}backarrow.svg`} alt="" />
          </button>

          <span id="titleBox">
            <p id="title">Du bist am Ziel angekommen</p>
          </span>

          <div id="components">
            <span className="header">Deine Daten zur Route:</span>
            <div id="goalDataCont">
              <div id="GoalData">
                <div className="bar">
                  <span>Strecke: </span>
                  <p>{utility.round2Fixed(trail.distance)} km</p>
                </div>
                <div className="bar">
                  <span>Dauer: </span>
                  <p>{utility.round2Fixed(trail.duration / 60)} h</p>
                </div>
              </div>

              <hr />

              <span className="header">
                Möchtest du eine Bewertung abgeben?
              </span>
              <div id="rtng">
                <span>
                  Bewertungen bisher:
                  <p id={'NumBewrt'}>
                    <b />
                    {this.ratingCounter()}
                  </p>
                </span>
              </div>

              <Rating
                editable={true}
                filter={false}
                pop={rating => this.retrieveRating(rating)}
              />
            </div>
          </div>
          <div id="lower_bar_placeholder" />
        </div>

        <div id="lower_bar">
          <div className="buttonBox">
            <button
              className="roundButton"
              onClick={this.returnToPositionScreen}
              id="noRate"
            >
              <img src={`${imgURL}delete.svg`} alt="" />
            </button>
            <p>Kein Rating</p>
          </div>

          <div className="buttonBox">
            <button
              disabled={!this.state.data.rating}
              className={`roundButton ${
                !this.state.data.rating ? 'disabled' : ''
              }`}
              onClick={ e => this.handleClickRatingButton(e)}
              id="rate"
            >
              <span
                onClick={() => {
                  !this.state.data.rating &&
                    NotificationManager.info(
                      '',
                      'Wähle die Anzahl der Sterne, mit den du die Route bewerten willst (min. 1 Stern)',
                      5000
                    );
                }}
              >
                <img src={`${imgURL}star.svg`} alt="rate route" />
              </span>
            </button>
            <p>Rating abgeben</p>
          </div>
        </div>
      </div>
    );
  }
}
