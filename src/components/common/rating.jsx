import React, { Component } from 'react';
import StarRatingComponent from 'react-star-rating-component';

import './style/rating.css';

class Rating extends Component {
  state = {
    rating: this.props.filter ? 0 : 0,
    rated: false
  };

  onStarClick = (nextValue, prevValue, name) => {
    const rating = this.state.rating;
    if (rating === nextValue) {
      this.setState({ rating: 0, rated: false }, () => {
        this.popRatingToParent();
      });
    } else {
      this.setState({ rating: nextValue, rated: true }, () => {
        this.popRatingToParent();
      });
    }
  };

  setValue = () => {
    if (this.props.editable) {
      return this.state.rating;
    }
    return this.props.value;
  };

  resetRating = () => {
    this.setState({ rating: 0, rated: false }, () => {
      this.popRatingToParent();
    });
  };

  popRatingToParent = () => {
    this.props.pop(this.state.rating);
  };

  render() {
    return (
      <div className="ratingBox">
        <StarRatingComponent
          name="rating"
          starCount={5}
          value={this.setValue()}
          onStarClick={this.onStarClick}
          editing={this.props.editable}
        />
      </div>
    );
  }
}

export default Rating;
