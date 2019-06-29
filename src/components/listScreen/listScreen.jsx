import React from "react";

import ListTab from './listTab';

import "./style/listScreen.css";

function ListScreen(props) {

  return (
    <div id="list">
      <div id="listContent">
        {Object.keys(props.Keys).map(key => {
          return (
            <ListTab
              key={key}
              id={`list_${key}`}
              title={props.Keys[key]}
              type={key}
              trails={props.Trails[key]}
              onCardClick={props.onCardClick}
              dataReceived={(props.Trails['new'].length > 0)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ListScreen;
