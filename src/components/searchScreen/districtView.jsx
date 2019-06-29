import React, { Component } from 'react';
import {
  Map,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
    GeoJSON
} from 'react-leaflet';
import L from 'leaflet';
import { url } from '../../URL';
import utility from '../../util/distanceUtility';
import './style/districtView.css';

const imgURL = window.location.origin + '/img/';

var locationIcon = L.icon({
  iconUrl: imgURL + 'location_marker.svg',
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65]
});

class DistrictView extends Component {
  constructor(props) {
    super(props);
    if (this.props.districtInfo.target === undefined) {
      this.props.history.push(url.mapView);
    }
  }

  render() {
    if (this.props.districtInfo.target === undefined) {
      return null;
    }
    //let trails = this.props.districtInfo.target.feature.properties.trails;
      let trails = this.props.trails;
    //console.log(this.props.districtInfo.target.feature);
    //let hitLat = this.props.districtInfo.latlng.lat;
    //let hitLng = this.props.districtInfo.latlng.lng;
    //let hitPosition = [hitLat, hitLng];
    //console.log(this.props.districtInfo.target.feature.geometry.coordinates);
    var coords = this.props.districtInfo.target.feature.geometry.coordinates[0];
      var distCent_unswichted = utility.getCentroid(coords);
      var distCent = [distCent_unswichted[1], distCent_unswichted[0]];

    return (
      <div>
        <Map
          id="myMap"
          center={distCent}
          zoomSnap={0.25}
          zoom={11}
          zoomControl={false}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {trails.map(trail => (
            <Polyline
              key={trail._id}
              onClick={() => this.props.onTrailClick(trail._id)}
              onDblClick={() => this.props.onTrailClick(trail._id)}
              positions={trail.latLng}
              color={trail.color}
              weight={5}
            />
          ))}
          {trails.map(trail => (
            <div key={trail._id}>
              <Marker
                icon={locationIcon}
                position={trail.latLng[Math.round(trail.latLng.length/2)]}
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
            <GeoJSON
                data={this.props.districtInfo.target.feature}
                style={{
                    weight: 2,
                    opacity: 1,
                    color: 'black',
                    dashArray: '3',
                    fillOpacity: 0,
                }}
            />
        </Map>

        <button
          id="backFromDistrict"
          className="backButton"
          onClick={this.props.backToMap}
        >
          <img src={`${imgURL}backarrow.svg`} alt="" />
        </button>
      </div>
    );
  }
}

export default DistrictView;
