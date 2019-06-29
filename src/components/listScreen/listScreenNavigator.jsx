import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import ListScreen from './listScreen';
import DetailView from '../common/detailView';
import WalkRouter from '../searchScreen/walkTheTrail/walkRouter';

import trailService from '../../services/trailService';
import ownTrailsService from '../../services/ownTrailsService';

import './style/listScreen.css';
import 'react-notifications/lib/notifications.css';
import { url } from '../../URL';
import {NotificationManager} from "react-notifications";

const color = '#3477C5';

class ListScreenNavigator extends Component {
  _isMounted = false;

  state = {
    keys: {
      last: 'Deine letzten Wanderrouten',
      trend: 'Die trendigsten Wanderrouten',
      new: 'Neuste Wanderrouten'
    },
    trails: {
      last: [],
      trend: [],
      new: []
    },
    details: {
      routeID: -1,
      clickedTrail: {}
    },
    circleRadius: 50
  };

  componentDidMount() {
    this.props.index(2);
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async componentWillMount() {
    let lastTrails = (await ownTrailsService
      .getLatestOwnTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .pageNumber(1)
      .pageSize(3)
      .execute()).data;
    this.paintColor(lastTrails);

    let trendTrails = (await trailService
      .getBestTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .pageNumber(1)
      .pageSize(3)
      .execute()).data;
    this.paintColor(trendTrails);

    let newestTrails = (await trailService
      .getLatestTrails()
      .withParams()
      .expandPois()
      .expandRoute()
      .pageNumber(1)
      .pageSize(3)
      .execute()).data;
    this.paintColor(newestTrails);

    let data = [lastTrails, trendTrails, newestTrails];
    let latLng = [];
    data.forEach(arr => {
      arr.forEach(trail => {
        trail.route.routepoints.forEach(rp => {
          latLng.push([rp.latitude, rp.longitude]);
          return rp; //Zum ignorieren von Konsolenwarnung
        });
        trail.latLng = latLng;
        latLng = [];
        return trail; //Zum ignorieren von Konsolenwarnung
      });
    });

    let trails = this.state.trails;
    trails.last = lastTrails;
    trails.trend = trendTrails;
    trails.new = newestTrails;

    if (this._isMounted) this.setState({ trails: trails });
  }

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

  handleCardClick = trailId => {
    let details = {};
    let trails = this.state.trails;
    let idx = 0;
    let ky = '';
    for (var key in trails) {
      idx = trails[key].findIndex(trail => trail._id === trailId);
      if (idx >= 0) {
        ky = key;
        break;
      }
    }
    details.clickedTrail = trails[ky][idx];
    details.routeID = trailId;
    this.setState({ details: details });
    this.props.history.push(url.listDetailView);
  };

    updateTrailonRating = async(trailID) =>{
        //console.log(trailID);
        let trails = this.state.trails;
        try {
            var trailData = await trailService.getTrail(trailID);
            var trail = trailData.data;
            //tconsole.log(trail);
            let idx = 0;
            let ky = '';
            for (var key in trails) {
                idx = trails[key].findIndex(trail => trail._id === trailID);
                if (idx >= 0) {
                    ky = key;
                    break;
                }
            }
            trails[ky][idx].rating = trail.rating;
            this.setState({trails:trails});
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

    }

  handleGoBack = () => {
    this.props.history.goBack();
  };

  toWalkScreen = () => {
    this.props.history.push(url.listScreen + url.walkView);
  };

  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route
            path={url.listScreen + '/my'}
            render={props => (
              <ListScreen
                Keys={this.state.keys}
                Trails={this.state.trails}
                onCardClick={this.handleCardClick}
                {...props}
              />
            )}
          />
          <Route
            path={url.listDetailView}
            render={props => (
              <DetailView
                key={Math.random()}
                trail={this.state.details.clickedTrail}
                id={this.state.details.routeID}
                backToAll={this.handleGoBack}
                toWalk={this.toWalkScreen}
                circleRadius={this.state.circleRadius}
                parentUrl={this.props.location.pathname}
                {...props}
              />
            )}
          />
          <Route
            path={url.listScreen + url.walkView}
            render={props => (
              <WalkRouter
                details={this.state.details}
                trail={this.state.details.clickedTrail}
                parentUrl={this.props.location.pathname}
                updateT ={this.updateTrailonRating}
                {...props}
              />
            )}
          />
          <Redirect from={url.listScreen} to={url.listScreen + '/my'} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default ListScreenNavigator;
