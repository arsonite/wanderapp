import React, { Component } from 'react';
import auth from '../../services/authService';

class RestApiHome extends Component {
  state = {};
  render() {
    return (
      <div className="container-fluid">
        <div style={{ marginTop: 400 }} className="text-center">
          <h1 style={{ fontSize: 80 }} className="badge badge-info">
            Rest Api Testfeld
          </h1>
          {!auth.userIsSignedIn() && (
            <h3>bitte einloggen oder registrieren um zu starten</h3>
          )}
        </div>
      </div>
    );
  }
}

export default RestApiHome;
