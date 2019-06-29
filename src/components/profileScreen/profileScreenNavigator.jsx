import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import DetailView from '../common/detailView';
import ProfileScreen from './profileScreen';
import WalkRouter from '../searchScreen/walkTheTrail/walkRouter';

import ownTrailsService from '../../services/ownTrailsService';
import likedTrailsService from '../../services/likedTrailsService';

import { url } from '../../URL.json';

import './style/profileScreen.css';
import trailService from '../../services/trailService';
import { NotificationManager } from 'react-notifications';

const keys = [
  { key: 'recorded', title: 'Privat' },
  { key: 'uploaded', title: 'Veröffentlicht' },
  { key: 'added', title: 'Favorit' }
];
const color = '#3477C5';

class ProfileScreenNavigator extends Component {
  _isMounted = false;

  state = {
    selection: {
      recorded: false,
      uploaded: false,
      added: false
    },
    empty: {
      recorded: false,
      uploaded: false,
      added: false
    },
    isEmpty: true,
    details: { routeID: -1, clickedTrail: {} },
    trails: [],
    circleRadius: 50,
    edit: undefined
  };

  componentDidMount() {
    this.props.index(3);
    this._isMounted = true;
    this.retrieveTrails();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  retrieveTrails = async () => {
    let trails = [];
    let obj = await ownTrailsService
      .getOwnTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .onlyUnpublished()
      .execute();
    this.appendStatus(obj.data, 0);
    trails = trails.concat(obj.data);

    obj = await ownTrailsService
      .getOwnTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .onlyPublished()
      .execute();
    this.appendStatus(obj.data, 1);
    trails = trails.concat(obj.data);

    obj = await likedTrailsService
      .getLikedTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .execute();
    this.appendStatus(obj.data, 2);
    trails = trails.concat(obj.data);

    this.setEmptyNotificationDueToAllSectionsAreEmpty();
    this.paintColor(trails);

    if (this._isMounted) {
      this.setState({
        trails: trails
      });
    }
  };

  appendStatus = (trails, trailTypeIdx) => {
    trails.forEach(trail => (trail.status = trailTypeIdx));
    if (trails.length > 0) return;

    const empty = { ...this.state.empty };
    empty[this.getKeyByTrailTypeIdx(trailTypeIdx)] = true;
    this.setState({ empty });
  };

  getKeyByTrailTypeIdx = trailTypeIdx =>
    Object.keys(this.state.empty)[trailTypeIdx];

  paintColor = trails => {
    let latLng = [];
    trails.forEach(trail => {
      trail.route.routepoints.forEach(rp => {
        latLng.push([rp.latitude, rp.longitude]);
        return rp; //Zum ignorieren von Konsolenwarnung
      });
      trail.latLng = latLng;
      latLng = [];
      return trail; //Zum ignorieren von Konsolenwarnung
    });
    for (var i = 0; i < trails.length; i++) {
      trails[i].color = color;
    }
  };

  toggle = filter => {
    const selection = { ...this.state.selection };
    Object.keys(selection).forEach(key => {
      if (key === filter) selection[key] = !selection[key];
      else selection[key] = false;
    });

    this.setState({ selection }, () => {
      if (selection[filter])
        this.setState({ isEmpty: this.state.empty[filter] });
      else this.setEmptyNotificationDueToAllSectionsAreEmpty();
    });
  };

  setEmptyNotificationDueToAllSectionsAreEmpty() {
    const valueArray = Object.entries(this.state.empty).map(
      entries => entries[1]
    );
    this.setState({ isEmpty: valueArray.every(isEmpty => isEmpty) });
  }

  isSelected = filter => {
    return this.state.selection[filter];
  };

  isVisible = i => {
    if (this.state.selection[keys[i].key]) {
      return true;
    }
    for (let key in this.state.selection) {
      if (this.state.selection[key]) {
        return false;
      }
    }
    return true;
  };

  deleteTrail = trailID => {
    if (window.confirm('Willst du diese Route wirklich löschen?')) {
      ownTrailsService.deleteOwnTrail(trailID);
      let trails = this.state.trails;
      let idx = trails.findIndex(trail => trail._id === trailID);
      trails.splice(idx, 1);
      this.setState({ trails: trails });
    }
  };

  handleCardClick = (trailId, edit) => {
    this.setState({ edit: edit }, () => {
      let details = { ...this.state.details };
      let trails = this.state.trails;
      let idx = trails.findIndex(trail => trail._id === trailId);
      details.clickedTrail = trails[idx];
      details.routeID = trailId;
      this.setState({ details: details });
      this.props.history.push(url.profileDetailView);
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

  handleGoBack = () => {
    this.props.history.goBack();
  };

  handleGoDetail = () => {
    this.props.history.go();
  };

  toWalkScreen = () => {
    this.props.history.push(url.profileScreen + url.walkView);
  };

  favourizeFinished = () => {
    this.retrieveTrails();
  };

  editFinished = async () => {
    this.retrieveTrails();
  };

  render = () => {
    return (
      <React.Fragment>
        <Switch>
          <Route
            path={url.profileScreen + '/myTrails'}
            render={props => (
              <ProfileScreen
                key={Math.random() * 1000}
                keys={keys}
                Selected={this.isSelected}
                Toggle={this.toggle}
                trails={this.state.trails}
                Status={this.isVisible}
                Delete={this.deleteTrail}
                onCardClick={this.handleCardClick}
                isEmpty={this.state.isEmpty}
                {...props}
              />
            )}
          />
          <Route
            path={url.profileDetailView}
            render={props => (
              <DetailView
                key={Math.random()}
                edit={this.state.edit}
                editFinished={this.editFinished}
                trail={this.state.details.clickedTrail}
                id={this.state.details.routeID}
                backToAll={this.handleGoBack}
                toWalk={this.toWalkScreen}
                circleRadius={this.state.circleRadius}
                parentUrl={this.props.location.pathname}
                favourizeFinished={this.favourizeFinished}
                {...props}
              />
            )}
          />
          <Route
            path={url.profileScreen + url.walkView}
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
          <Redirect
            from={url.profileScreen}
            to={url.profileScreen + '/myTrails'}
          />
        </Switch>
      </React.Fragment>
    );
  };
}

export default ProfileScreenNavigator;
