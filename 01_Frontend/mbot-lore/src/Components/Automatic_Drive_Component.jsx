import React, { useState } from "react";
import "./css/Automatic_Drive.css";
import InfoPanel from "./InfoPenal";


const ControlPanel = () => {
  const [direction, setDirection] = useState(null);
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [route, setRoute] = useState("");

  const handleMove = (dir) => {
    setDirection(dir);
    setDistance((prev) => prev + 1);
    setRuntime((prev) => prev + 1);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleRouteChange = (event) => {
    setRoute(event.target.value);
  };

  const handleDriveStop = () => {
    setIsDriving((prev) => !prev); // Toggle zwischen Drive und Stop
  };

  const handleDefineRoute = () => {
    alert("Route defined");
  };

  return (
    <div className="control-panel">
      <div className="manual-controls">
        <div className="control-buttons">
          <button className="control-button" onClick={handleDefineRoute}>
            Define Route
          </button>
          <select className="route-select" value={route} onChange={handleRouteChange}>
            <option value="">Select Route</option>
            <option value="route1">Route 1</option>
            <option value="route2">Route 2</option>
            <option value="route3">Route 3</option>
          </select>
          <button className="control-button" onClick={handleDriveStop}>
            {isDriving ? "Stop" : "Drive"}
          </button>
        </div>
        <div className="direction-buttons-up">
          <button
            className={`control-button up ${direction === "up" ? "active" : ""}`}
            onClick={() => handleMove("up")}
          >
            ↑
          </button>
        </div>
        <div className="direction-buttons">
          <button
            className={`control-button left ${direction === "left" ? "active" : ""}`}
            onClick={() => handleMove("left")}
          >
            ←
          </button>
          <button
            className={`control-button down ${direction === "down" ? "active" : ""}`}
            onClick={() => handleMove("down")}
          >
            ↓
          </button>
          <button
            className={`control-button right ${direction === "right" ? "active" : ""}`}
            onClick={() => handleMove("right")}
          >
            →
          </button>
        </div>
      </div>

      <div className="robot-placeholder">
        {direction ? (
          <img src={`/images/${direction}.png`} alt={`Robot facing ${direction}`} />
        ) : (
          "Robot Placeholder"
        )}
      </div>

      {/* Einblenden-Button, wenn die Infobox eingeklappt ist */}
      {isCollapsed && (
        <button className="reveal-info-button" onClick={toggleCollapse}>
         ◁
        </button>
      )}

      {/* InfoPanel */}
      <InfoPanel
        distance={distance}
        runtime={runtime}
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ControlPanel;
