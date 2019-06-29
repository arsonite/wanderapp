import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import FilterButton from '../common/filterButton';
import Card from '../common/card';

import authService from '../../services/authService';

import { url } from '../../URL.json';

import './style/profileScreen.css';

class ProfileScreen extends Component {
  render() {
    return (
      <React.Fragment>
        <div id="profile">
          <div id="profileContent">
            <div id="subnav">
              <p id="pSubNav">Filtern nach:</p>
              <div id="subNavButtons">
                {this.props.keys.map(key => {
                  return (
                    <FilterButton
                      key={key.key}
                      title={key.title}
                      id={`filter_${key.key}`}
                      src={`${key.key}.svg`}
                      selected={this.props.Selected(key.key)}
                      toggle={this.props.Toggle.bind(this, key.key)}
                    />
                  );
                })}
              </div>
            </div>
            {this.props.isEmpty ? (
              <p id="noRoute">Keine Routen vorhanden.</p>
            ) : (
              ''
            )}
            {this.props.trails.map(trail => {
              return (
                <Card
                  trail={trail}
                  key={Math.random() * 1000}
                  type="profile"
                  symbol={this.props.keys[trail.status].key}
                  status={this.props.Status(trail.status)}
                  delete={this.props.Delete}
                  onCardClick={this.props.onCardClick}
                />
              );
            })}
          </div>

          <footer id="profile_options">
            <Link to={url.profileEditView}>Profil bearbeiten</Link>
            <Link to={url.tutorialView}>Hilfe</Link>
            <hr />
            <Link to={url.impressum}>Impressum</Link>
            <Link to={url.datenschutz}>Datenschutzerklärung</Link>
            <hr />
            <Link to={url.loginView} onClick={authService.logout}>
              Abmelden
            </Link>
          </footer>
        </div>
      </React.Fragment>
    );
  }
}

export default ProfileScreen;
