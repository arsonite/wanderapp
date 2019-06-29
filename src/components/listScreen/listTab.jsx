import React from 'react';

import Card from '../common/card';

import './style/listTab.css';

function ListTab(props) {
  return (
    <div id={props.id} className="list_tab">
      <p>{props.title}</p>
      {(props.dataReceived && props.trails.length === 0)
        ? <p id="noRoute">Keine Routen vorhanden.</p>
        : props.trails.map(trail => {
          return (
            <Card
              key={trail._id}
              id={trail._id}
              trail={trail}
              type={props.type}
              status={true}
              onCardClick={props.onCardClick}
            />
          );
        }
        )
      }
    </div>
  );
}

export default ListTab;
