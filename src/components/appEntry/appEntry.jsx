import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";

import NavBar from "../navBar/navBar";

import LoginView from "../loginView/loginView";
import RegistrationView from "../registrationView/registrationView";

import TutorialView from "../tutorialView/tutorialView";

import RecordScreen from "../recordScreen/recordScreen";
import SubmitTrailView from "../recordScreen/submitTrailView";
import SearchScreen from "../searchScreen/searchScreen";
import ListScreenNavigator from "../listScreen/listScreenNavigator";
import ProfileScreenNavigator from "../profileScreen/profileScreenNavigator";
import ProfileEditView from "../profileScreen/profileEditView";
import Impressum from "../profileScreen/impressum";
import Datenschutz from "../profileScreen/datenschutz";

import authService from "../../services/authService";

import { url } from "../../URL.json";

class AppEntry extends Component {
  state = {
    selectIndex: undefined,
  };

  updateSelectIndex = index => {
    this.setState({ selectIndex: index });
  };

  render() {
    return (
      <div id="app">
        <NavBar selectIndex={this.state.selectIndex} />
        <main>
          <Switch>
            <Route path={url.loginView} component={LoginView} />
            <Route path={url.registrationView} component={RegistrationView} />
            {!authService.userIsSignedIn() ? (
              <Redirect to={url.loginView} />
            ) : (
              ""
            )}
            <Route path={url.tutorialView} component={TutorialView} />
            <Route path={url.submitTrailView} component={SubmitTrailView} />
            <Route
              path={url.recordScreen}
              render={props => (
                <RecordScreen {...props} index={this.updateSelectIndex} />
              )}
            />
            <Route
              path={url.searchScreen}
              render={props => (
                <SearchScreen {...props} index={this.updateSelectIndex} />
              )}
            />
            <Route
              path={url.listScreen}
              render={props => (
                <ListScreenNavigator
                  {...props}
                  index={this.updateSelectIndex}
                />
              )}
            />
            <Route path={url.profileEditView} component={ProfileEditView} />
            <Route path={url.impressum} component={Impressum} />
            <Route path={url.datenschutz} component={Datenschutz} />
            <Route
              path={url.profileScreen}
              render={props => (
                <ProfileScreenNavigator
                  {...props}
                  index={this.updateSelectIndex}
                />
              )}
            />
            {authService.userIsSignedIn() ? (
              <Redirect to={url.profileScreen} />
            ) : (
              ""
            )}
          </Switch>
        </main>
      </div>
    );
  }
}

export default AppEntry;
