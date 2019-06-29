import React, { Component } from 'react';
import { Map, TileLayer, Marker, Polyline, Circle } from 'react-leaflet';
import { NotificationManager } from 'react-notifications';
import L from 'leaflet';

import utility from '../../../util/distanceUtility';

import { url } from '../../../URL.json';

import './style/walkTrail.css';

const imgURL = window.location.origin + '/img/';

var myIcon = L.icon({
  iconUrl: imgURL + 'location_marker.svg',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65]
});

var checkUserAtGoal;

class WalkTrail extends Component {
  state = {
    warning: true
  };

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
    clearInterval(checkUserAtGoal);
  }

  componentDidMount() {
    checkUserAtGoal = setInterval(this.userAtGoal, 1000);
    this.props.onCenter();
    NotificationManager.success(
      'Viel Spaß bei der Wanderung.',
      'Startpunkt wurde erreicht!',
      5000
    );
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

  userAtGoal = () => {
    var markerPosition = [this.props.marker.lat, this.props.marker.lng];
    var endPoint = this.getEndPoint();
    var d =
      utility.getDistanceBetweenTwoPoints(markerPosition, endPoint) * 1000;
    if (d < this.props.distanceRadius) {
      this.props.history.push(this.props.URL + url.walkFinish);
    }
  };

  distanceToGoal() {
    var markerPosition = [this.props.marker.lat, this.props.marker.lng];
    var endPoint = this.getEndPoint();
    var d =
      utility.getDistanceBetweenTwoPoints(markerPosition, endPoint) * 1000;
    return d;
  }

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

  render() {
    if (this.props.details.routeID < 0) {
      return null;
    }
    this.props.line.bringToFront();
    const position = [this.props.center.lat, this.props.center.lng];
    const markerPosition = [this.props.marker.lat, this.props.marker.lng];
    const center = this.getEndPoint();
    var trail = this.props.trail;

    return (
      <React.Fragment>
        <div id="walkTrail">
          <Map
            id="map"
            center={position}
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
            <Circle
              key={trail._id}
              center={center}
              radius={this.props.distanceRadius}
            />
              {this.isLost()}
            <Marker
              position={markerPosition}
              ref={this.props.refmaker}
              draggable={this.props.draggable}
              onDragend={() => this.props.onDrag()}
            />
            <Marker
              key={Math.random() * 15}
              icon={myIcon}
              position={trail.latLng[0]}
            />
            <Marker
              key={Math.random()}
              icon={myIcon}
              position={trail.latLng[trail.latLng.length - 1]}
            />
          </Map>
          <button className="roundButton" onClick={this.props.onCenter}>
            <img src={imgURL + 'position.svg'} alt="" />
          </button>

          <span id="titleBox">
            <p id="title">
              Distanz zum Endpunkt: {Math.floor(this.distanceToGoal())} meter
            </p>
          </span>

          <button onClick={this.props.backToDetail} className="backButton">
            <img src={`${imgURL}backarrow.svg`} alt="" />
          </button>
        </div>
      </React.Fragment>
    );
  }
}
export default WalkTrail;
