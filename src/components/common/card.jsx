import React, { Component } from 'react';
import { Map, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

import Rating from '../common/rating';

import getZoomLevelForTrail from '../../services/zoomLevelService';

import utility from '../../util/distanceUtility';

import './style/card.css';

const color = '#3477C5';
const imgURL = window.location.origin + '/img/';
const icon = L.icon({
  iconUrl: imgURL + 'location_marker.svg',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65]
});

class Card extends Component {
  formatDate = date => {
    return date.split('T')[0].replace(/-/g, '.');
  };

  getSnapshot = trail => {
    if (trail.latLng.length < 1) return null;
    return (
      <Map
        key={trail._id}
        className="snapshot"
        center={[
          trail.latLng[Math.floor(trail.latLng.length / 2)][0],
          trail.latLng[Math.floor(trail.latLng.length / 2)][1]
        ]}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        zoomControl={false}
        zoom={getZoomLevelForTrail(trail, 100, 100)}
        attributionControl={false}
        attribution={false}
        touchZoom={false}
        boxZoom={false}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          icon={icon}
          position={[
            trail.latLng[Math.floor(trail.latLng.length / 2)][0],
            trail.latLng[Math.floor(trail.latLng.length / 2)][1]
          ]}
        />
        <Polyline weight={5} positions={trail.latLng} color={color} />
      </Map>
    );
  };

  getComponents = type => {
    switch (type) {
      case 'last':
        break;
      case 'trend':
        const rating =
          this.props.trail.rating !== undefined
            ? this.props.trail.rating
            : { stars: 0, counter: '/' };
        return (
          <span className="rating">
            <div>
              <Rating value={rating.stars} editable={false} />
              <span>({rating.counter})</span>
            </div>
            <span>
              von <b>{this.props.trail.user.firstname}</b>
            </span>
          </span>
        );
      case 'new':
        return (
          <span className="date">
            <p>{this.formatDate(this.props.trail.created_at)}</p>
            <p>
              von <b>{this.props.trail.user.firstname}</b>
            </p>
          </span>
        );
      case 'profile':
        let hidden = this.props.trail.status === 2;
        const trail = this.props.trail;
        return (
          <div id="components">
            <span className="distance">
              {utility.round2Fixed(trail.distance)} km
            </span>

            <span className="duration">
              {utility.round2Fixed(trail.duration / 60)} h
            </span>

            <div
              className={`add_btn${hidden ? ' hidden' : ''}`}
              onClick={() => this.props.onCardClick(trail._id, true)}
            >
              <img src={`${imgURL}edit.svg`} alt="" />
            </div>
            <div
              className={`del_btn${hidden ? ' hidden' : ''}`}
              onClick={() => this.props.delete(trail._id)}
            >
              <img src={`${imgURL}trash.svg`} alt="" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className={`card${this.props.status ? '' : ' hidden'}`}>
          <div className="frame">
            <span className="title">
              <p>{this.props.trail.name}</p>
              <div
                className={`symbol ${
                  this.props.type === 'profile' ? '' : 'hidden'
                }`}
              >
                {this.props.symbol ? (
                  <img
                    src={`${imgURL}filter/${this.props.symbol}.svg`}
                    alt=""
                  />
                ) : (
                  ''
                )}
              </div>
            </span>
            {this.getComponents(this.props.type)}
            <div
              className="mapFrame"
              onClick={() =>
                this.props.onCardClick(this.props.trail._id, false)
              }
            />
            {this.getSnapshot(this.props.trail)}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Card;
