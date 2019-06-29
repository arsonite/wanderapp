import React, { Component } from "react";
import { Map, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { LocationService } from "../../services/locationService";
import { NotificationManager } from "react-notifications";

import { url } from "../../URL.json";

import "react-notifications/lib/notifications.css";
import "./style/recordScreen.css";

const ls = new LocationService();
const imgURL = window.location.origin + "/img/";

var locationIcon = L.icon({
  iconUrl: imgURL + "location_marker.svg",
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -65],
});

const status = ["...", "Aufnahme läuft...", "Aufnahme pausiert"];

export default class RecordScreen extends Component {
  _isMounted = false;

  state = {
    location: [52.3, 13.24],
    zoom: 14,
    trail: {},
    displayState: 0, //1 - Recording //2 - Paused //3 - Stopped
    routepoints: [],
    distance: "",
    duration: "",
    blockedLocation: false,
    timeout: false,
    line: new L.polyline([]),
  };

  componentDidMount = () => {
    this.props.index(0);
    this._isMounted = true;
    let map = this.refs.recMap.leafletElement;
    this.state.line.addTo(map);
    ls.trackLocation(false);
    ls.trackLocation(true);
    ls.on("currentPosition", p => {
      if (this._isMounted) {
        if (this.state.displayState === 1) {
          this.addToLine(p);
        }
        this.setState({
          location: [p.coords.latitude, p.coords.longitude],
        });
      }
    });
    ls.on("cancelRecord", () => {
      if (this._isMounted) {
        this.resetState();
      }
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
    ls.trackLocation(false);
    ls.removeAllListeners("currentPosition", this);
    ls.removeAllListeners("cancelRecord", this);
  }

  addToLine(p) {
    var latLngs = this.state.line.getLatLngs();
    //console.log(this.state.line.getLatLngs());
    if (latLngs.length < 1) {
      this.state.line.addLatLng(
        new L.LatLng(p.coords.latitude, p.coords.longitude),
      );
      return;
    }
    var length = latLngs.length;
    //console.log(latLngs[latLngs.length - 1]);
    if (
      latLngs[length - 1].lat === p.coords.latitude &&
      latLngs[length - 1].lng === p.coords.longitude
    ) {
      return;
    }
    this.state.line.addLatLng(
      new L.LatLng(p.coords.latitude, p.coords.longitude),
    );
  }

  handleStartRecording = () => {
    if (this.state.displayState !== 2) {
      this.resetState();
      ls.recordRoute();
      NotificationManager.info(
        "Wir können dich sonst nicht lokalisieren.",
        "Lasse deinen Bildschirm während der Aufnahme an",
        5000,
      );
    } else {
      ls.resumeRecord();
    }
    this.setState({ displayState: 1 });
  };

  handlePauseRecording = () => {
    this.setState({ displayState: 2 });
    ls.pauseRecord();
  };

  handleStopRecording = () => {
    const trailData = ls.getTrail();

    if (trailData.distance < 500) {
      let missing = Math.round(500 - trailData.distance);
      NotificationManager.warning(
        "Es fehlen noch " + missing + "m um die Route abzuschicken.",
        "Deine Route ist zu kurz",
        7000,
      );
    } else {
      this.handleDisplayState(3);

      this.setState({
        displayState: 3,
      });
      ls.stopRecord();

      this.setState({
        routepoints: trailData.routepoints,
        duration: trailData.duration,
        distance: trailData.distance,
      });
      this.props.history.push({
        pathname: url.submitTrailView,
        state: { trail: trailData },
      });
    }
  };

  handleRoutepointChange = event => {
    this.setState({ routepoints: event.target.value });
  };

  handleDistanceChange = event => {
    this.setState({ distance: event.target.value });
  };

  handleDurationChange = event => {
    this.setState({ duration: event.target.value });
  };

  handleDisplayState = index => {
    this.setState({ displayState: index });
  };

  resetState = () => {
    ls.trackLocation(false);
    ls.trackLocation(true);
    let line = this.state.line;
    line.setLatLngs([]);
    this.setState({
      displayState: 0,
      trail: {},
      routepoints: [],
      distance: "",
      duration: "",
      line: line,
    });
  };

  onZoomChange = e => {
    let zoom = this.state.zoom;
    zoom = e._zoom;
    this.setState({ zoom: zoom });
  };

  render() {
    const displayState = this.state.displayState;

    return (
      <div id="record">
        <div className="mapContainer">
          <Map
            className="map"
            center={this.state.location}
            zoom={this.state.zoom}
            zoomControl={false}
            attributionControl={false}
            attribution={false}
            onZoomend={e => this.onZoomChange(e)}
            ref="recMap"
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={this.state.location} icon={locationIcon} />
          </Map>
        </div>
        <div />
        <button
          className={`backButton${displayState === 0 ? " hidden" : ""}`}
          onClick={() => {
            if (
              window.confirm("Die bereits aufgenommene Route wird verworfen!")
            ) {
              this.resetState();
            }
          }}
        >
          <img src={`${imgURL}backarrow.svg`} alt="" />
        </button>

        <div className={`buttonContainer${displayState === 0 ? " down" : ""}`}>
          <div className="buttonBox">
            <div
              id="start"
              className={`button${displayState === 2 ? " left" : ""}`}
            >
              <button
                className={`roundButton${
                  displayState === 1 && this.state.blockedLocation === false
                    ? " hidden"
                    : ""
                }`}
                onClick={() => {
                  this.handleDisplayState(1);
                  this.handleStartRecording();
                }}
              >
                <img id="recordImg" src={`${imgURL}nav/s_record.svg`} alt="" />
              </button>
            </div>

            <div className="button">
              <button
                className={`roundButton${displayState === 1 ? "" : " hidden"}`}
                onClick={() => {
                  this.handleDisplayState(2);
                  this.handlePauseRecording();
                }}
              >
                <img src={`${imgURL}pause.svg`} alt="" />
              </button>
            </div>

            <div
              id="stop"
              className={`button${displayState === 2 ? " right" : ""}`}
            >
              <button
                className={`roundButton${displayState === 2 ? "" : " hidden"}`}
                onClick={() => {
                  this.handleStopRecording();
                }}
              >
                <img src={`${imgURL}stop.svg`} alt="" />
              </button>
            </div>
          </div>
          <div id="display">{status[this.state.displayState]}</div>
        </div>
      </div>
    );
  }
}
