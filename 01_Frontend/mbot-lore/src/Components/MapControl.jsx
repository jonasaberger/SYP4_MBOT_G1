import React from "react";
import "./css/MapControl.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";

const MapControl = () => {
  // Statisches zweidimensionales Array
  const grid = [
    [0, 1, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0],
  ];

  return (
    <div className="map-container">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="map-row">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`map-cell ${cell === 1 ? "obstacle" : "empty"}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MapControl;