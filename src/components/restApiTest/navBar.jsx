import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import auth from '../../services/authService';

import 'bootstrap/dist/css/bootstrap.css';

const NavBar = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <Link
        style={{ color: 'Aquamarine' }}
        className="navbar-brand ml-5"
        to="/start/restApiHome"
      >
        wander-app
      </Link>
      <NavLink
        className="nav-item nav-link"
        style={{ color: 'lightgrey' }}
        to="/start/showTrails"
      >
        Show Trails
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          {!auth.userIsSignedIn() && (
            <React.Fragment>
              <NavLink className="nav-item nav-link" to="/start/login">
                Login
              </NavLink>
              <NavLink className="nav-item nav-link" to="/start/register">
                Register
              </NavLink>
            </React.Fragment>
          )}
          {auth.userIsSignedIn() && (
            <React.Fragment>
              <NavLink className="nav-item nav-link" to="/start/trails">
                Trails
              </NavLink>
              <NavLink className="nav-item nav-link" to="/start/trailForm">
                Trail-Form
              </NavLink>
              <NavLink className="nav-item nav-link" to="/start/pois">
                POIs
              </NavLink>
              <NavLink
                style={{ marginRight: 50 }}
                className="nav-item nav-link"
                to="/start/poiForm"
              >
                POI-Form
              </NavLink>
            </React.Fragment>
          )}
          {auth.userIsSignedIn() ? (
            <React.Fragment>
              <span style={{ color: 'Khaki' }} className="navbar-brand">
                {auth.getCurrentUser().firstname}{' '}
              </span>
              <span style={{ color: 'Khaki' }} className="navbar-brand">
                {auth.getCurrentUser().lastname}
              </span>
              <Link
                className="btn btn-outline-danger"
                onClick={auth.logout}
                to="/start/restApiHome"
              >
                Logout
              </Link>
            </React.Fragment>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
