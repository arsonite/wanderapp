import React, { Component, createRef } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import L from 'leaflet';
import { NotificationManager } from 'react-notifications';
import GoToStart from './goToStart';
import WalkTrail from './walkTrail';
import ArriveAtGoal from './arriveAtGoal';

import trailService from '../../../services/trailService';
import { LocationService } from '../../../services/locationService';

import utility from '../../../util/distanceUtility';

import { url } from '../../../URL.json';

import './style/walkTrail.css';

const ls = new LocationService();
var unMounted;
var lost;
var  eventCounter;

class WalkRouter extends Component {
  state = {
    center: {
      lat: 52.505,
      lng: 13.44,
      zoom: 15
    },
    marker: {
      lat: 52.508,
      lng: 13.339,
      zoom: 15
    },
    init: true,
    zoom: 13,
    trail: {},
    startPoint: [],
    distanceRadius: 50,
    promiseResolved: false,
    draggable: false,
    rating: '',
    distances: [],
    line: new L.polyline([], { color: '#b51743', weight: 4 }),
      lost: false
  };

  refmaker = createRef();

  constructor(props) {
    super(props);
    if (this.props.details.routeID < 0) {
      if (this.props.parentUrl.includes('/search'))
        this.props.history.push(url.mapView);
      else if (this.props.parentUrl.includes('/list'))
        this.props.history.push(url.listScreen);
      else if (this.props.parentUrl.includes('/profile'))
        this.props.history.push(url.profileScreen);
    }
  }

  componentWillMount() {
    unMounted = false;
  }

  async componentDidMount() {
    if (this.props.details.routeID !== -1) {
      //console.log("valid");
      var trailX = await trailService.getTrail(this.props.details.routeID);
      trailX = trailX.data;
      let latLng = [];
      trailX.route.routepoints.map(rp => {
        latLng.push([rp.latitude, rp.longitude]);
        return null;
      });
      trailX.latLng = latLng;
      this.setState({ trail: trailX });
      //console.log(this.state.promiseResolved);
      var startP = this.locateStartPoint();
      this.setState({ startPoint: startP });
      let cntr = { ...this.state.center };
      cntr.lat = startP[0];
      cntr.lng = startP[1];
      cntr.zoom = 15;
      eventCounter = 0;
      this.setState({ center: cntr });
      this.getDistance();
      if (!unMounted) {
        ls.trackLocation(true);
      }
      ls.on('currentPosition', p => {
        if(eventCounter < 7) {
            eventCounter++;
        }
        var position = {...this.state.marker};
        position.lat = p.coords.latitude;
        position.lng = p.coords.longitude;
        this.addPointsToLine(position);
        //this.state.line.addLatLng(new L.LatLng(position.lat, position.lng));
          //console.log(this.state.line.getLatLngs());
          //this.correctLineonStart();
          this.setState({marker: position});
          if (this.state.init) {
            this.center();
            var startP = this.locateStartPoint();
            this.setState({startPoint: startP});
            this.setState({init: false});
              }
          });
      this.setState({ promiseResolved: true });
    }
  }
  getUrl() {
    if (this.props.parentUrl.includes('/search')) return url.searchScreen;
    else if (this.props.parentUrl.includes('/list')) return url.listScreen;
    else if (this.props.parentUrl.includes('/profile'))
      return url.profileScreen;
  }

  correctLineonStart() {
      var coords = this.state.line.getLatLngs();
      if (coords.length < 2) {
          return;
      }
      var len = coords.length;
      var point1 = [coords[len - 1].lat,coords[len - 1].lng];
      var point2 = [coords[len - 2].lat,coords[len - 2].lng];
      var dist = utility.getDistanceBetweenTwoPoints(point1, point2) * 1000;
      if (dist > 80) {
          console.log(coords);
          var newCoords = coords.slice(0, len-2);
          console.log(newCoords);
          this.state.line.setLatLngs(newCoords);
      }
  }

  addPointsToLine(point){
    //onsole.log(eventCounter);
    var coords = this.state.line.getLatLngs();
    var len = coords.length;
    if(eventCounter < 4){
      return;
    }
    if (coords.length < 1) {
          this.state.line.addLatLng(new L.LatLng(point.lat, point.lng));
          return;
    }
    if(coords.length === 2){
      //console.log('error?')
      var point1 = [coords[len - 1].lat,coords[len - 1].lng];
      var point2 = [coords[len - 2].lat,coords[len - 2].lng];
      var dist1 = utility.getDistanceBetweenTwoPoints(point1, point2) * 1000;
      if (dist1 > 50) {
        var newCoords = coords.slice(1, len);
        console.log(newCoords);
        this.state.line.setLatLngs(newCoords);
          }
      }
    var latLng = [point.lat,point.lng];
    var lastPoint = [coords[len - 1].lat,coords[len - 1].lng];
    var dist = utility.getDistanceBetweenTwoPoints(latLng, lastPoint) * 1000;
    console.log(coords);
      if (dist > 80) {
        if(!lost) {
            NotificationManager.warning(
                'Bitte begib dich in die Nähe des Linienendpunkts!',
                'Wir haben dich verloren!',
                5000
            );
        }
        lost = true;
        return;
      }
      lost = false;
      this.state.line.addLatLng(new L.LatLng(point.lat, point.lng));

  }



  componentWillUnmount() {
    unMounted = true;
    ls.trackLocation(false);
    ls.removeAllListeners('currentPosition', this);
  }

  toggleDraggable = () => {
    this.setState({ draggable: !this.state.draggable });
  };

  updatePosition = () => {
    const marker = this.refmaker.current;
    if (marker != null) {
        if(eventCounter < 7) {
            eventCounter++;
        }
        this.addPointsToLine(marker.leafletElement.getLatLng());
      //this.state.line.addLatLng(marker.leafletElement.getLatLng());
      //this.correctLineonStart();
      var me = { ...this.state.marker };
      me.lat = marker.leafletElement.getLatLng().lat;
      me.lng = marker.leafletElement.getLatLng().lng;
      this.setState({
        marker: me
      });
    }
  };

  getDistance() {
    let trail = this.state.trail;
    if (trail.distance < 1) {
      let distance = 15;
      this.setState({ distanceRadius: distance });
    }
  }

  updateDistances = distance => {
    let distances = this.state.distances;
    distances.push(distance);
    this.setState({ distances: distances });
  };

  clearDistances = () => {
    let empty = this.state.distances;
    empty = [];
    this.setState({ distances: empty });
  };

  locateStartPoint() {
    var userPosition = [this.state.marker.lat, this.state.marker.lng];
    var trailPoints = this.state.trail.latLng;
    var startRoute = trailPoints[0];
    var endRoute = trailPoints[trailPoints.length - 1];
    var d1 = utility.getDistanceBetweenTwoPoints(userPosition, startRoute);
    var d2 = utility.getDistanceBetweenTwoPoints(userPosition, endRoute);
    if (d1 < d2) {
      return startRoute;
    } else {
      return endRoute;
    }
  }

  center = () => {
    var position = { ...this.state.marker };
    var center = { ...this.state.center };
    center.lat = position.lat;
    center.lng = position.lng;
    center.zoom = position.zoom;
    this.setState({ center: center });
  };

  handleDrag = e => {
    var myCenter = { ...this.state.center };
    var center = e.target.getCenter();
    myCenter.lat = center.lat;
    myCenter.lng = center.lng;
    myCenter.zoom = e.target._zoom;
    this.setState({ center: myCenter });
  };

  handleZoom = e => {
    var myCenter = { ...this.state.center };
    var myPos = { ...this.state.marker };
    myCenter.zoom = e.target._zoom;
    myPos.zoom = e.target._zoom;
    this.setState({ center: myCenter });
    this.setState({ marker: myPos });
  };

  handleGoBack = () => {
    this.props.history.goBack();
  };
  handleBackToPosition = () => {
    this.props.history.go(-2);
  };

  render() {
    if (this.props.details.routeID < 0) {
      return null;
    }
    if (!this.state.promiseResolved) {
      return null;
    }
    return (
      <React.Fragment>
        <Switch>
          <Route
            path={this.getUrl() + url.goToStart}
            render={props => (
              <GoToStart
                details={this.props.details}
                marker={this.state.marker}
                center={this.state.center}
                trail={this.props.trail}
                startP={this.state.startPoint}
                onZoom={this.handleZoom}
                onCenter={this.center}
                draggable={this.state.draggable}
                onDrag={this.updatePosition}
                refmaker={this.refmaker}
                latLngs={this.state.latLngs}
                line={this.state.line}
                distanceRadius={this.state.distanceRadius}
                backToDetail={this.handleGoBack}
                URL={this.getUrl()}
                onMapDrag={this.handleDrag}
                lost={lost}
                {...props}
              />
            )}
          />
          <Route
            path={this.getUrl() + url.walkTrail}
            render={props => (
              <WalkTrail
                details={this.props.details}
                marker={this.state.marker}
                center={this.state.center}
                trail={this.props.trail}
                startP={this.state.startPoint}
                onCenter={this.center}
                onZoom={this.handleZoom}
                draggable={this.state.draggable}
                onDrag={this.updatePosition}
                refmaker={this.refmaker}
                updateDistances={this.updateDistances}
                distanceRadius={this.state.distanceRadius}
                backToDetail={this.handleBackToPosition}
                URL={this.getUrl()}
                onMapDrag={this.handleDrag}
                line={this.state.line}
                lost={lost}
                {...props}
              />
            )}
          />
          <Route
            path={this.getUrl() + url.walkFinish}
            render={props => (
              <ArriveAtGoal
                details={this.props.details}
                marker={this.state.marker}
                center={this.state.center}
                trail={this.props.trail}
                startP={this.state.startPoint}
                distances={this.state.distances}
                clearD={this.clearDistances}
                distanceRadius={this.state.distanceRadius}
                URL={this.getUrl()}
                line={this.state.line}
                updateT ={this.props.updateT}
                {...props}
              />
            )}
          />
          <Redirect
            from={this.getUrl() + url.walkView}
            to={this.getUrl() + url.goToStart}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default WalkRouter;
