import React from 'react';
import { Link } from 'react-router-dom';

import './style/navigation.css';

import { url } from '../../URL.json';

const imgURL = window.location.origin + '/img/nav/';

function Navigation(props) {
  return (
    <Link
      to={url[`${props.name}Screen`]}
      id={`nav_${props.name}`}
      className={`navigation${props.selected ? ' current' : ''}`}
    >
      <img
        src={imgURL + (props.selected ? 's_' : '') + `${props.name}.svg`}
        alt=""
      />
    </Link>
  );
}

export default Navigation;
