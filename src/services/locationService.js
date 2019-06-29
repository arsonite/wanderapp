import { getDistance, getTimeInMinutes } from "./routeService";
import { NotificationManager } from "react-notifications";

const EventEmitter = require("events");

let watchId; // geolocation.watchPosition ID
let record; // boolean true <- user is recording
let positions; // Array for geolocation.Positions Objects
let geoloc;
let routepoints;
let distanceCounter;
//let distance;

class LocationService extends EventEmitter {
  constructor() {
    super();
    record = false;
    positions = [];
    routepoints = [];
    distanceCounter = 0;
    geoloc = navigator.geolocation;
  }

  /**
   * @param {boolean} track true <- starts tracking process,
   * false ends tracking process
   */
  trackLocation(track) {
    if (track) {
      watchId = geoloc.watchPosition(
        this.handleLocationFound,
        this.handleNoLocationFound,
        this.positionOptions,
      );
    } else {
      routepoints = [];
      positions = [];
      distanceCounter = 0;
      geoloc.clearWatch(watchId);
    }
  }

  getTrail() {
    let distance = getDistance(positions);
    let duration = getTimeInMinutes(distance);
    return {
      distance: distance,
      routepoints: routepoints,
      duration: duration,
    };
  }

  handleLocationFound = pos => {
    this.emit("currentPosition", pos);
    if (
      positions.length > 1 &&
      getDistance([positions[positions.length - 1], pos]) > 0.15
    ) {
      distanceCounter++;

      if (distanceCounter > 7) {
        window.confirm(
          "Bei der Aufnahme deiner Route ist ein Fehler aufgetreten. Routenpunkte haben einen zugroßen Abstand voneinander.",
        );
        this.emit("cancelRecord");
      }
      return;
    }

    if (record) {
      positions.push(pos);
      routepoints.push({
        latitude: pos.coords.latitude.toString(),
        longitude: pos.coords.longitude.toString(),
        altitude: pos.coords.altitude === null ? 0 : pos.coords.altitude,
        timestamp: pos.timestamp,
      });
    }
  };

  handleNoLocationFound = error => {
    console.log("no location found", error);
    if (error.message === "User denied Geolocation") {
      this.emit("userBlocksLocation", error);
      if (
        window.confirm(
          "Um diesen Dienst benutzen zu können musst du dein GPS anschalten.",
        )
      ) {
        this.trackLocation(false);
        this.trackLocation(true);
      }
      return;
    } else if (error.message === "Timeout expired") {
      this.emit("timeout", error);
      NotificationManager.warning(
        "Na sind wa in Brandenburg?",
        "Wir können dich gerade nicht lokalisieren",
        3000,
      );
      return;
    } else {
      fetch("http://ipapi.co/json")
        .then(function(res) {
          return res.json();
        })
        .then(function(loc) {
          console.log(JSON.stringify(loc));
        });
    }
  };

  positionOptions = {
    enableHighAccuracy: true,
    timeout: 7000,
    maximumAge: 7000,
  };

  recordRoute() {
    record = true;
  }
  pauseRecord() {
    record = false;
  }
  resumeRecord() {
    record = true;
  }
  stopRecord() {
    record = false;
  }
}

export { LocationService };
