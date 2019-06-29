import React from 'react';

import './style/slide.css';

function Slide(props) {
  return (
    <div id={props.id} className="slide">
      <span className="title">{props.title}</span>
      <div className="icon">{props.icon}</div>
      <div className="content">{props.content}</div>
    </div>
  );
}

export default Slide;
