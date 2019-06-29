import React, { Component } from 'react';
import poiService from '../../services/poiService';

class Pois extends Component {
  state = {
    pois: []
  };

  async componentDidMount() {
    const { data: pois } = await poiService.getPois();
    this.setState({ pois });
  }

  render() {
    return (
      <React.Fragment>
        <h2 className="mt-5">POIs</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Beschreibung</th>
              <th>POIs</th>
            </tr>
          </thead>
          <tbody>
            {this.state.pois.map(poi => (
              <tr key={poi._id}>
                <td>{poi.description}</td>
                <td>
                  <span>
                    {poi.pictures.map(pic => (
                      <img
                        key={pic.path}
                        src={pic.path}
                        alt="Testbild"
                        height="300"
                      />
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default Pois;
