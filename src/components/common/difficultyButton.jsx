import React, { Component } from 'react';

import './style/difficultyButton.css';

class DifficultyButton extends Component {
  state = {};
  render() {
    return (
      <div
        id="difficultyButton"
        className={`form-control form-rounded${
          this.props.selected ? ' selected' : ''
        }`}
        onClick={this.props.switchButton}
      >
        {this.props.text}
      </div>
    );
  }
}

export default DifficultyButton;
