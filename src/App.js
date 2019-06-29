import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ApplicationEntry from "./components/restApiTest/applicationEntry";
import NotFound from "./components/notFound";
import AppEntry from "./components/appEntry/appEntry";

import { url } from "./URL.json";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.css";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <NotificationContainer />
        <ToastContainer />
        <Switch>
          <Route path="/start" component={ApplicationEntry} />
          <Route path={url.appEntry} component={AppEntry} />
          <Route path="/not-found" component={NotFound} />
          <Redirect to="/not-found" />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;
