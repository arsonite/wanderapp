import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';
import lineIntersect from '@turf/line-intersect';
import L from 'leaflet';
import MapView from './mapView';
import DistrictView from './districtView';
import PositionView from './positionView';
import DetailView from '../common/detailView';
import WalkRouter from './walkTheTrail/walkRouter';
import trailService from '../../services/trailService';
import surfaceService from '../../services/surfaceService';
import utility from '../../util/distanceUtility';
import berlinJSON from './berlinGEO';
import { url } from '../../URL.json';

import './style/searchScreen.css';

class SearchScreen extends Component {
  _isMounted = false;

  state = {
    counter: 0,
    positionOverview: {
      lat: 52.45,
      lng: 13.4
    },
    position: {
      lat: 52.505,
      lng: 13.34,
      radius: 100,
      zoom: 13
    },
    zoom: 9.5,
    trails: [],
    berlinJson: {},
    grades: [],
    showDistrictDetails: {
      targetDistrict: {}
    },
    details: {
      routeID: -1,
      clickedTrail: {}
    },
    colors: [
      '#BF0B2C',
      '#02173D',
      '#0AA38C',
      '#F5900F',
      '#F24E13',
      '#79BD8F',
      '#00A388'
    ],
    heatColors: ['#FFF', '#ffffcc', '#FFFF85', '#FFEA5A', '#FF7D3E', '#FF493B'],
    promiseResolved: false,
    filterApplied: false,
    filterQueries: {},
    surfaces: []
  };

  constructor(props) {
    super(props);
    this.state.berlinJson = berlinJSON;
  }

  aquireTrails = async () => {
    let filterQueries = this.state.filterQueries;
    console.log(await trailService.getNumbersOfTrails());
    let obj = await trailService
      .getTrails()
      .withParams()
      .searchForTrailName(filterQueries.trailName)
      .searchInTags(filterQueries.tags)
      .durationFrom(filterQueries.durationFrom)
      .durationUntil(filterQueries.durationUntil)
      .distanceFrom(filterQueries.distanceFrom)
      .distanceUntil(filterQueries.distanceUntil)
      .minStars(filterQueries.rating)
      .includeDifficulty(filterQueries.difficulty)
      .includeSurface(filterQueries.surfaces)
      .expandPois()
      .expandRoute()
      .execute();

    let trails = obj.data;
    if (trails.length === 0) {
      NotificationManager.warning(
        'Es wurden keine Routen mit den Suchkriterien gefunden',
        'Suche war nicht erfolgreich',
        5000
      );
      trails = this.state.trails;
    }
    let latLng = [];
    trails.forEach(trail => {
      trail.route.routepoints.forEach(rp => {
        latLng.push([rp.latitude, rp.longitude]);
        return null;
      });
      trail.latLng = latLng;
      latLng = [];
      return null;
    });

    utility.addCircleRadiusToTrails(trails);
    this.addColorToTrails2(trails);
    trails = trails.sort((a, b) => {
      return a.intersections - b.intersections;
    });
    if (this._isMounted) this.setState({ trails: trails });
    this.routesInDistrict();
    let grades = this.getGrades();
    if (this._isMounted) this.setState({ grades: grades });
    if (this._isMounted) this.setState({ promiseResolved: true });
  };

  async componentDidMount() {
    this.props.index(1);
    this._isMounted = true;
    const surfaces = await surfaceService.getSurfaces();
    this.setState({ surfaces: surfaces.data }, () => {
      this.aquireTrails();
    });
  }

  componentWillMount() {}

  componentWillUnmount() {
    this._isMounted = false;
  }

  cancelFilter = async () => {
    if (this._isMounted)
      this.setState({ filterQueries: {}, filterApplied: false }, () => {
        this.aquireTrails();
      });
  };

  retrieveFilterQueries = async data => {
    if (this._isMounted)
      this.setState({ filterQueries: data, filterApplied: true }, () => {
        this.aquireTrails();
      });
  };

  getGrades() {
    let districts = this.state.berlinJson.features;
    var nums = [];
    for (var i = 0; i < districts.length; i++) {
      nums.push(districts[i].properties.trailNum);
    }
    nums = nums.filter(this.onlyUnique);
    nums = nums.sort((a, b) => {
      return a - b;
    });
    return nums;
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  addColorToTrails2(trails) {
    var latLngs1 = [];
    var latLngs2 = [];
    var baseColor = '#3388ff';
    for (var i = trails.length - 1; i >= 0; i--) {
      latLngs1 = trails[i].latLng;
      trails[i].color = baseColor;
      trails[i].intersections = 0;
      for (var j = 0; j < trails.length - 1; j++) {
        if (trails[i]._id === trails[j]._id) {
          continue;
        }
        latLngs2 = trails[j].latLng;
        var inter = lineIntersect(
          new L.polyline(latLngs1).toGeoJSON(),
          new L.polyline(latLngs2).toGeoJSON()
        );
        if (inter.features[0] === undefined) {
          continue;
        } else {
          baseColor = this.shadeColor2(baseColor, -0.25);
          trails[i].color = baseColor;
          trails[i].intersections += 1;
        }
      }
      baseColor = '#3388ff';
    }
  }

  shadeColor2(color, percent) {
    var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00ff,
      B = f & 0x0000ff;
    return (
      '#' +
      (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
      )
        .toString(16)
        .slice(1)
    );
  }

  routesInDistrict() {
    var trails = this.state.trails;
    var lengthLatLng = 0;
    var start = [];
    var districts = berlinJSON.features;
    var midPoint = [];
    var dCoord = [];

    for (var a = 0; a < districts.length; a++) {
      districts[a].properties.trailNum = 0;
      districts[a].properties.trails = [];
    }

    for (var i = 0; i < trails.length; i++) {
      lengthLatLng = trails[i].latLng.length;
      if (lengthLatLng < 1) {
        continue;
      }
      start = trails[i].latLng[0];
      midPoint = trails[i].latLng[Math.floor(lengthLatLng / 2)];
      for (var j = 0; j < districts.length; j++) {
        dCoord = districts[j].geometry.coordinates[0];
        if (
          utility.isMarkerInsidePolygon(start, dCoord) ||
          utility.isMarkerInsidePolygon(midPoint, dCoord)
        ) {
          districts[j].properties.trailNum += 1;
          districts[j].properties.trails.push(trails[i]);
        } else {
          continue;
        }
      }
    }

    var geoJson = this.state.berlinJson;
    geoJson.features = districts;
    if (this._isMounted) this.setState({ berlinJson: geoJson });
  }

  addColorToTrails(trails) {
    for (var i = 0; i < trails.length; i++) {
      trails[i].color = this.generateColor();
    }
  }

  generateColor() {
    let color = this.state.colors[
      Math.floor(Math.random() * this.state.colors.length)
    ];
    return color;
  }

  getColor = r => {
    var grades = this.state.grades;
    var max = grades[grades.length - 1];
    var percentage = (r / max) * 100;
    var color = this.state.heatColors;
    if (percentage > 80) return color[5];
    if (percentage > 60) return color[4];
    if (percentage > 40) return color[3];
    if (percentage > 20) return color[2];
    if (percentage > 0) return color[1];
    if (percentage >= 0) return color[0];
  };

  style = feature => {
    return {
      fillColor: this.getColor(feature.properties.trailNum),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  onEachFeature = (feature, layer) => {
    layer.on('click', e => {
      var layer = e;
      var showDistrict = this.state.showDistrictDetails;
      showDistrict.on = true;
      showDistrict.targetDistrict = layer;
      if (this._isMounted) this.setState({ showDistricDetails: showDistrict });
      this.props.history.push(url.districtView);
    });
  };

  updateTrailonRating = async trailID => {
    let trails = this.state.trails;
    try {
      var trailData = await trailService.getTrail(trailID);
      var trail = trailData.data;
      //console.log(trail);
      let idx = trails.findIndex(trail => trail._id === trailID);
      trails[idx].rating = trail.rating;
      this.setState({ trails: trails });
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
  };

  handleToWalk = trailID => {
    let details = { ...this.state.details };
    details.routeID = trailID;
    if (this._isMounted) this.setState({ details: details });
    this.props.history.push(url.searchScreen + url.walkView);
  };

  activateMyPosition = () => {
    this.props.history.push(url.positionView);
  };

  handleTrailClick = trailId => {
    let details = { ...this.state.details };
    let trails = this.state.trails;
    let idx = trails.findIndex(trail => trail._id === trailId);
    details.clickedTrail = trails[idx];
    details.routeID = trailId;
    this.setState({ details: details });
    this.props.history.push(url.searchScreen + url.detailView);
  };

  handleGoBack = () => {
    this.props.history.goBack();
  };

  handleBackFromPosition = () => {
    this.props.history.push(url.mapView);
  };

  render() {
    if (!this.state.promiseResolved) return null;
    this.addColorToTrails2(this.state.trails);
    return (
      <div id="search">
        <Switch>
          <Route
            path={url.positionView}
            render={props => (
              <PositionView
                key={Math.random()}
                position={this.state.position}
                trails={this.state.trails}
                backToMap={this.handleBackFromPosition}
                onTrailClick={this.handleTrailClick}
                circleRadius={this.state.circleRadius}
                {...props}
              />
            )}
          />
          <Route
            path={url.districtView}
            render={props => (
              <DistrictView
                key={Math.random()}
                districtInfo={this.state.showDistrictDetails.targetDistrict}
                backToMap={this.handleGoBack}
                onTrailClick={this.handleTrailClick}
                details={this.state.details}
                circleRadius={this.state.circleRadius}
                trails={this.state.trails}
                {...props}
              />
            )}
          />
          <Route
            path={url.searchScreen + url.detailView}
            render={props => (
              <DetailView
                key={Math.random()}
                trail={this.state.details.clickedTrail}
                id={this.state.details.routeID}
                backToAll={this.handleGoBack}
                toWalk={this.handleToWalk}
                circleRadius={this.state.circleRadius}
                parentUrl={this.props.location.pathname}
                {...props}
              />
            )}
          />

          <Route
            path={url.mapView}
            render={props => (
              <MapView
                key={Math.random()}
                position={this.state.positionOverview}
                zoom={this.state.zoom}
                berlinJSON={this.state.berlinJson}
                trails={this.state.trails}
                grades={this.state.grades}
                districtStyle={this.style}
                onEachFeature={this.onEachFeature}
                color={this.getColor}
                onActivateLocation={this.activateMyPosition}
                promiseResolved={this.state.promiseResolved}
                onSubmit={this.retrieveFilterQueries}
                cancelFilter={this.cancelFilter}
                filterApplied={this.state.filterApplied}
                surfaces={this.state.surfaces}
                {...props}
              />
            )}
          />
          <Route
            path={url.searchScreen + url.walkView}
            render={props => (
              <WalkRouter
                details={this.state.details}
                trail={this.state.details.clickedTrail}
                parentUrl={this.props.location.pathname}
                updateT={this.updateTrailonRating}
                {...props}
              />
            )}
          />
          <Redirect from={url.searchScreen} to={url.mapView} />
        </Switch>
      </div>
    );
  }
}

export default SearchScreen;
