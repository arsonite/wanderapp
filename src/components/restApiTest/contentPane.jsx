import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import RegisterForm from './registerForm';
import LoginForm from './loginForm';
import PoiForm from './poiForm';
import TrailForm from './trailForm';
import Trails from './trails';
import Pois from './pois';
import RestApiHome from './restApiHome';
import PoiPreSelectForm from './poiPreSelectForm';

class ContentPane extends Component {
  state = {
    images: []
  };

  handleSelectedFiles = images => {
    console.log('handled');
    this.setState({ images });
  };

  render() {
    return (
      <div className="m-5">
        <Switch>
          <Route path="/start/login" component={LoginForm} />
          <Route path="/start/register" component={RegisterForm} />
          <Route path="/start/trails" component={Trails} />
          <Route
            path="/start/trailForm"
            render={props => (
              <TrailForm imagesFiles={this.state.images} {...props} />
            )}
          />
          <Route path="/start/poiForm" component={PoiForm} />
          <Route path="/start/pois" component={Pois} />
          <Route
            path="/start/poiPreSelectForm"
            render={props => (
              <PoiPreSelectForm
                onSelected={this.handleSelectedFiles}
                {...props}
              />
            )}
          />
          <Route to="/start/StartHome" component={RestApiHome} />
        </Switch>
      </div>
    );
  }
}

export default ContentPane;
