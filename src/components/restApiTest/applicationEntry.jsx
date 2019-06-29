import React, { Component } from 'react';

import NavBar from './navBar';
import ContentPane from './contentPane';

class ApplicationEntry extends Component {
  state = {};
  render() {
    return (
      <div className="">
        <NavBar />
        <ContentPane />
      </div>
    );
  }
}

export default ApplicationEntry;
