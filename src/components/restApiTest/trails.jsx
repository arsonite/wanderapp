import React, { Component } from 'react';
import trailService from '../../services/trailService';

class Trails extends Component {
  state = {
    trails: []
  };

  async componentDidMount() {
    const { data: trails } = await trailService.getTrails()
                                    .withParams()
                                    .expandPois()
                                    .expandRoute()
                                    .execute();
    this.setState({ trails });
  }

  showPictures(trail) {
    if (trail.pois && trail.pois.length > 0) {
      return trail.pois.map(poi => (
        <span key={poi._id}>
          {poi.pictures.map(pic => (
            <img
              key={pic.path}
              src={pic.path}
              alt="Testbild"
              height="100"
              width="100"
            />
          ))}
        </span>
      ));
    } else {
      return <span />;
    }
  }

  render() {
    // table.table>thead>tr>th*4
    // tbody>tr>td*4
    return (
      <React.Fragment>
        <h2 className="mt-5">Trails</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Streckenlänge [m]</th>
              <th>Laufdauer [min]</th>
              <th>RoutePoints</th>
              <th>Bilder</th>
            </tr>
          </thead>
          <tbody>
            {this.state.trails.map(trail => (
              <tr key={trail._id}>
                <td>{trail.name}</td>
                <td>{trail.distance}</td>
                <td>{trail.duration}</td>
                <td>
                  {trail.route.routepoints.map(rp => (
                    <span key={rp._id}>
                      {'[' + rp.latitude + ', ' + rp.longitude + '], '}
                    </span>
                  ))}
                </td>
                <td>{this.showPictures(trail)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default Trails;
