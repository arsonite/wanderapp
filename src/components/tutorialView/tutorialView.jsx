import React, { Component } from 'react';
import SwipeableViews from 'react-swipeable-views';

import Slide from './slide';

import { url } from '../../URL.json';

import './style/tutorialView.css';

const imgURL = window.location.origin + '/img/';

class TutorialView extends Component {
  endTutorial = () => {
    this.props.history.push(url.searchScreen);
  };

  state = {
    slides: {
      '0': {
        title: 'Wilkommen zur',
        icon: (
          <div>
            <p id="p1">Wander</p>
            <p id="p2">App</p>
          </div>
        ),
        content: 'Streiche um mit der Einführung der Features zu beginnen',
        selected: true
      },
      '1': {
        title: 'Route aufnehmen',
        icon: <img src={`${imgURL}nav/record.svg`} alt="" />,
        content: 'Nimm deine Wanderroute auf und teile sie mit anderen Nutzern',
        selected: false
      },
      '2': {
        title: 'Route suchen',
        icon: <img src={`${imgURL}nav/search.svg`} alt="" />,
        content:
          'Durchsuche und filtere die Karte nach Wanderrouten von anderen Nutzern die dir gefallen',
        selected: false
      },
      '3': {
        title: 'Routenlisten',
        icon: <img src={`${imgURL}nav/list.svg`} alt="" />,
        content:
          'Schau dir deine zuletzt gewanderten Routen an und durchstöbere die neusten und trendigsten Routen von anderen Nutzern',
        selected: false
      },
      '4': {
        title: 'Dein Bereich',
        icon: <img src={`${imgURL}nav/profile.svg`} alt="" />,
        content:
          'Verwalte deine privaten, veröffentlichten und favourisierten Routen und bearbeite dein Profil',
        selected: false
      },
      '5': {
        title: 'Das war´s!',
        icon: (
          <img src={`${imgURL}arrow.svg`} alt="" onClick={this.endTutorial} />
        ),
        content: 'Tippe auf den Pfeil um zur App zu gelangen',
        selected: false
      }
    }
  };

  switchDot = index => {
    let slides = this.state.slides;
    for (let s in slides) {
      if (s === index + '') {
        slides[s].selected = true;
        continue;
      }
      slides[s].selected = false;
    }
    this.setState({ slides, index });
  };

  render() {
    return (
      <div id="tutorial">
        <SwipeableViews onChangeIndex={this.switchDot} enableMouseEvents={true}>
          {Object.keys(this.state.slides).map(slide => {
            return (
              <Slide
                key={slide}
                title={this.state.slides[slide].title}
                icon={this.state.slides[slide].icon}
                content={this.state.slides[slide].content}
              />
            );
          })}
        </SwipeableViews>
        <div id="dotBox">
          <div id="hr" />
          <div id="dots">
            {Object.keys(this.state.slides).map(key => {
              return (
                <span
                  key={key}
                  id={`dot${key}`}
                  className={`dot${
                    this.state.slides[key].selected ? ' active' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default TutorialView;
