import React from 'react';

import './style/filterButton.css';

const imgURL = window.location.origin + '/img/filter/';

function FilterButton(props) {
  return (
    <div
      id={props.name}
      className={`filter ${props.selected ? 'selected' : ''}`}
      onClick={props.toggle}
    >
      <img src={imgURL + (props.selected ? 's_' : '') + props.src} alt="" />
      <p
        className={
          props.title !== undefined
            ? `pFilterButton${props.selected ? ' selected' : ''}`
            : 'hidden'
        }
      >
        {props.title}
      </p>
    </div>
  );
}

export default FilterButton;
