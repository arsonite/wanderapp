import React, { Component } from 'react';
import {
  Map,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';

import { LocationService } from '../../services/locationService';

import utility from '../../util/distanceUtility';

import './style/positionView.css';

const imgURL = window.location.origin + '/img/';
const ls = new LocationService();

var locationIcon = L.icon({
  iconUrl: imgURL + 'location_marker.svg',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65]
});

class PositionView extends Component {
  _isMounted = false;

  state = {
    center: {
      lat: 52.505,
      lng: 13.34,
      zoom: 13
    },

    position: {
      lat: 52.505,
      lng: 13.34,
      zoom: 13,
      radius: 10
    },
    weight: 5,
    centerAtStart: true
  };

  componentWillUnmount() {
    this._isMounted = false;
    ls.trackLocation(false);
    ls.removeAllListeners('currentPosition', this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      ls.trackLocation(true);
    }
    ls.on('currentPosition', p => {
      if (this._isMounted) {
        var position = { ...this.state.position };
        position.lat = p.coords.latitude;
        position.lng = p.coords.longitude;
        this.setState({ position: position });
        if (this.state.centerAtStart) {
          this.center();
          this.setState({ centerAtStart: false });
        }
      }
    });
  }

  center = () => {
    var position = { ...this.state.position };
    var center = { ...this.state.center };
    center.lat = position.lat;
    center.lng = position.lng;
    this.setState({ center: center });
  };

  handleDrag = () => {
    var map = this.refs.myMap.leafletElement;
    var center = map.getCenter();
    var myCenter = { ...this.state.center };
    myCenter.lat = center.lat;
    myCenter.lng = center.lng;
    myCenter.zoom = map._zoom;
    this.setState({ center: myCenter });
  };

  filterTrailsByDistance(trails) {
    let filteredTrails = [];
    let r = this.state.position.radius;
    let trailsChecked = [];
    let pos = [this.state.position.lat, this.state.position.lng];
    for (var i = 0; i < trails.length; i++) {
      if (trails[i].latLng.length < 1) {
        continue;
      } else {
        trailsChecked.push(trails[i]);
      }
    }
    filteredTrails = trailsChecked.filter(trail => {
      return utility.getDistanceBetweenTwoPoints(pos, trail.latLng[0]) <= r;
    });
    return filteredTrails;
  }

  render() {
    var position1 = this.state.position;
    const center1 = [this.state.center.lat, this.state.center.lng];
    let trails = this.props.trails;
    this.filterTrailsByDistance(trails);
    trails = this.filterTrailsByDistance(trails);
    return (
      <React.Fragment>
        <Map
          id="map"
          ref="myMap"
          center={center1}
          zoom={this.state.center.zoom}
          zoomControl={false}
          onDragend={this.handleDrag}
          onClick={e => {
            console.log(e);
          }}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker icon={locationIcon} position={[position1.lat, position1.lng]}>
            <Popup>
              I am here!! <br />
            </Popup>
          </Marker>
          {trails.map(trail => (
            <Polyline
              onClick={() => this.props.onTrailClick(trail._id)}
              onDblClick={() => this.props.onTrailClick(trail._id)}
              weight={this.state.weight}
              opacity={0.8}
              lineCap={'round'}
              key={trail._id}
              positions={trail.latLng}
              color={trail.color}
            />
          ))}
          {trails.map(trail => (
            <div key={trail._id}>
              <Marker
                icon={locationIcon}
                position={trail.latLng[0]}
                onClick={() => this.props.onTrailClick(trail._id)}
                onDblClick={() => this.props.onTrailClick(trail._id)}
              >
                <Tooltip>
                  Name: {trail.name} <br />
                  Schwierigkeit: {trail.difficulty} <br />
                  Distanz: {utility.round2Fixed(trail.distance)}km <br />
                  Erstellt von: {trail.user.firstname}
                </Tooltip>
              </Marker>
            </div>
          ))}
        </Map>
        <button
          id="backToOvMap"
          className="backButton"
          onClick={this.props.backToMap}
        >
          <img src={`${imgURL}backarrow.svg`} alt="" />
        </button>
        <button className="roundButton" onClick={this.center}>
          <img src={imgURL + 'position.svg'} alt="" />
        </button>
      </React.Fragment>
    );
  }
}

PositionView.propTypes = {};

export default PositionView;
