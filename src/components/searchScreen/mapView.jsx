import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

import FilterView from './filterView';

import './style/mapView.css';

const imgURL = window.location.origin + '/img/';

class MapView extends Component {
  state = {
    filterApplied: false,
    filterVisible: false
  };

  toggleFilter = () => {
    this.setState({ filterVisible: !this.state.filterVisible });
  };

  render() {
    const position = [this.props.position.lat, this.props.position.lng];
    return (
      <React.Fragment>
        <FilterView
          visible={this.state.filterVisible}
          toggle={this.toggleFilter}
          onSubmit={this.props.onSubmit}
          promiseResolved={this.props.promiseResolved}
          surfaces={this.props.surfaces}
        />

        <Map
          id="myMap"
          center={position}
          zoomSnap={0.25}
          zoom={this.props.zoom}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={false}
          zoomControl={false}
          boxZoom={false}
          touchZoom={false}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={this.props.berlinJSON}
            style={this.props.districtStyle}
            onEachFeature={this.props.onEachFeature}
          />
        </Map>

        <p id="descr">Anzahl der Routen</p>
        <div id="legend">
          {this.props.grades.map(grade => (
            <div key={grade}>
              <div
                style={{
                  background: this.props.color(grade),
                  width: 20,
                  height: 20
                }}
              />
              <p>{grade}</p>
            </div>
          ))}
        </div>

        <button
          className={`backButton${this.props.filterApplied ? '' : ' hidden'}`}
          onClick={this.props.cancelFilter}
        >
          <img src={`${imgURL}backarrow.svg`} alt="" />
        </button>

        <button id="filterButton" onClick={this.toggleFilter}>
          <img id="filterImg" src={imgURL + 'filter.svg'} alt="" />
        </button>

        <button className="roundButton" onClick={this.props.onActivateLocation}>
          <img src={imgURL + 'position.svg'} alt="" />
        </button>
      </React.Fragment>
    );
  }
}

export default MapView;
