import React from "react";
import Joi from "joi-browser";
import Form from "../common/form";
import trailService from "../../services/trailService";
import poiService from "../../services/poiService";
import surfaceService from "../../services/surfaceService";
import { NavLink } from "react-router-dom";

class TrailForm extends Form {
  state = {
    data: {
      name: "",
      description: "",
      distance: "",
      duration: "",
      routepoints: "",
      tags: ""
    },
    errors: {}
  };

  schema = {
    name: Joi.string()
      .min(2)
      .max(255)
      .required()
      .label("Name"),
    description: Joi.string()
      .required()
      .max(5000)
      .label("Beschreibung"),
    distance: Joi.number()
      .required()
      .min(0)
      .label("Streckenlänge [km]ss"),
    duration: Joi.number()
      .required()
      .min(0)
      .label("Laufdauer [h]"),
    routepoints: Joi.string()
      .required()
      .min(2)
      .label("Routepoint in pattern: '[lat,long], [...'"),
    tags: Joi.string()
      .max(1000)
      .label("Tags (mit einem Leerzeichen trennen!)")
  };

  async componentDidMount() {
    const { data: surfaces } = await surfaceService.getSurfaces();
    this.setState({ surfaces });
  }

  doSubmit = async () => {
    try {
      const { data: trail } = await trailService.saveTrailJustForApiTest(
        this.state.data,
      );
      console.log(trail);
      for (const poiId of trail.pois) {
        await poiService.addPicturesToPOI(poiId, this.props.imagesFiles);
      }
      console.log("push zu trails");
      this.props.history.push("/start/trails");
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        console.log("Error...");
        const errors = { ...this.state.errors };
        errors.loginEmail = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div>
        <h1>Trail Form</h1>
        {this.props.imagesFiles.length === 0 && (
          <h6>
            falls zu jedem Routepoint Bilder hinzugefügt werden sollen -> zuerst
            auf <NavLink to="/start/poiPreSelectForm">POI Preselect</NavLink>{" "}
            hochladen!
          </h6>
        )}

        <form onSubmit={this.handleSubmit}>
          {this.renderInput("name", "Name")}
          {this.renderInput("description", "Beschreibung")}
          {this.renderInput("distance", "Streckenlänge [km]", "number")}
          {this.renderInput("duration", "Laufdauer [h]", "number")}
          {this.renderInput(
            "routepoints",
            "Routepoint in pattern: '[lat,long], [...'",
          )}
          {this.renderInput("tags", "Tags  (mit einem Leerzeichen trennen!)")}
          {this.renderButton("Save")}
        </form>
      </div>
    );
  }
}

export default TrailForm;
