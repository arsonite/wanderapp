import React, { Component } from 'react';
import { Map, TileLayer, Marker, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';

import utility from '../../../util/distanceUtility';

import { url } from '../../../URL.json';

import './style/goToStart.css';

const imgURL = window.location.origin + '/img/';

var checkUser;

var greenIcon = L.icon({
  iconUrl: imgURL + 'location_marker.svg',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65]
});

export default class GotToStart extends Component {
  constructor(props) {
    super(props);
    if (this.props.details.routeID < 0) {
      if (this.props.URL.includes('/search'))
        this.props.history.push(url.mapView);
      else if (this.props.URL.includes('/list'))
        this.props.history.push(url.listScreen);
      else if (this.props.URL.includes('/profile'))
        this.props.history.push(url.profileScreen);
    }
  }

  componentWillUnmount() {
    clearInterval(checkUser);
  }

  componentDidMount() {
    checkUser = setInterval(this.switchRoute, 1000);
    let map = this.refs.myMap.leafletElement;
    this.props.line.addTo(map);
  }

  switchRoute = () => {
    const trailStart = this.props.startP;
    const markerPosition = [this.props.marker.lat, this.props.marker.lng];
    var d =
      utility.getDistanceBetweenTwoPoints(markerPosition, trailStart) * 1000;
    if (d < this.props.distanceRadius) {
      this.props.history.push(this.props.URL + url.walkTrail);
    }
  };


    isLost(){
        var line = this.props.line;
        var coords = line.getLatLngs();
        if (coords.length < 1) {
            return null;
        }
        var len = coords.length;
        var point = [coords[len - 1].lat,coords[len - 1].lng];
        if(this.props.lost) {
            return <Circle center={point} radius={80} color={'#b51743'}/>
        }else{
            return null;
        }

    }

  showCircle() {
    var trail = this.props.trail;
    const markerPosition = [this.props.marker.lat, this.props.marker.lng];
    var trailStart = this.props.startP;
    var d =
      utility.getDistanceBetweenTwoPoints(markerPosition, trailStart) * 1000;
    if (d > this.props.distanceRadius) {
      return (
        <Circle
          key={trail._id}
          center={trailStart}
          radius={this.props.distanceRadius}
        />
      );
    } else {
      return null;
    }
  }

  showMessage() {
    let startMessage = 'Begib dich zum Startpunkt der Route!';
    if (this.showCircle() === null) {
      startMessage = 'Du bist am Startpunkt der Route.';
      return startMessage;
    }
    return startMessage;
  }

  render() {
    if (this.props.details.routeID < 0) {
      return null;
    }
    this.props.line.bringToFront();
    const markerPosition = [this.props.marker.lat, this.props.marker.lng];
    var trail = this.props.trail;
    const positionStart = this.props.center;

    return (
      <React.Fragment>
        <div id="goToStart">
          <Map
            id="map"
            center={positionStart}
            zoom={this.props.center.zoom}
            zoomControl={false}
            ref="myMap"
            onZoomend={e => this.props.onZoom(e)}
            onDragend={e => this.props.onMapDrag(e)}
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
              {this.isLost()}
            <Marker
              position={markerPosition}
              draggable={this.props.draggable}
              onDragend={this.props.onDrag}
              ref={this.props.refmaker}
            />
            {this.showCircle()}
            <Marker
              key={Math.random() * 20}
              icon={greenIcon}
              position={trail.latLng[0]}
            />
            <Marker
              key={Math.random() * 14}
              icon={greenIcon}
              position={trail.latLng[trail.latLng.length - 1]}
            />
          </Map>

          <button className="roundButton" onClick={this.props.onCenter}>
            <img src={imgURL + 'position.svg'} alt="" />
          </button>

          <span id="titleBox">
            <p id="title">{this.showMessage()}</p>
          </span>

          <button onClick={this.props.backToDetail} className="backButton">
            <img src={`${imgURL}backarrow.svg`} alt="" />
          </button>

          <div id="messageStart">Bitte begib dich an den Start!</div>
        </div>
      </React.Fragment>
    );
  }
}
