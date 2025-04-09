import React from "react";
import "./css/MapPopup.css";

const MapPopup = ({ onClose, grid }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          &times;
        </button>
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
      </div>
    </div>
  );
};

export default MapPopup;