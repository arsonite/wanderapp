import React, { Component } from 'react';

import DifficultyButton from './difficultyButton';

import './style/difficulty.css';

const difficulties = ['Einfach', 'Mittel', 'Schwierig'];

class Difficulty extends Component {
  state = {
    selectedIndex: []
  };

  switchButton = i => {
    const selected = this.state.selectedIndex;
    const posOfI = selected.indexOf(i);

    if (posOfI > -1) {
      selected.splice(posOfI, 1);
    } else {
      selected.push(i);
    }
    this.setState({ selectIndex: selected });
    this.popRatingToParent();
  };

  popRatingToParent = () => {
    const selectIndex = this.state.selectedIndex;
    this.props.pop(selectIndex);
  };

  isSelected = i => {
    const selected = this.state.selectedIndex;
    if (selected.indexOf(i) > -1) {
      return false;
    } else {
      return true;
    }
  };

  render() {
    return (
      <div className="difficultyBox">
        {difficulties.map((difficulty, i) => {
          return (
            <DifficultyButton
              key={difficulty}
              text={difficulty}
              selected={this.state.selectedIndex.indexOf(i + 1) > -1}
              switchButton={this.switchButton.bind(this, i + 1)}
            />
          );
        })}
      </div>
    );
  }
}

export default Difficulty;
