import React, { Component } from 'react';

import DifficultyButton from './difficultyButton';

import './style/difficulty.css';

const difficulties = ['Einfach', 'Mittel', 'Schwierig'];

class DifficultySingle extends Component {
  state = {
    selectedIndex: null
  };

  switchButton = i => {
    this.setState({ selectedIndex: i }, () => {
      this.popRatingToParent();
    });
  };

  resetDifficulty = () => {
    this.setState({ selectedIndex: null }, () => {
      this.popRatingToParent();
    });
  };

  popRatingToParent = () => {
    const selectIndex = this.state.selectedIndex;
    this.props.pop(selectIndex !== null ? selectIndex + 1 : selectIndex);
  };

  render() {
    return (
      <div className="difficultyBox">
        {difficulties.map((difficulty, i) => {
          return (
            <DifficultyButton
              key={difficulty}
              text={difficulty}
              selected={i === this.state.selectedIndex}
              switchButton={this.switchButton.bind(this, i)}
            />
          );
        })}
      </div>
    );
  }
}

export default DifficultySingle;
