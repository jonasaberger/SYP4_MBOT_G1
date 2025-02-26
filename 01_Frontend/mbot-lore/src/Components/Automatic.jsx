import React, { useState } from "react";
import "./css/Automatic.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import { useEffect } from "react";

const ControlPanel = () => {
  const [direction, setDirection] = useState(null);
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [route, setRoute] = useState("");

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
      <div className="left-container">
        <div className="control-buttons">
          <button className="define-route-button" onClick={handleDefineRoute}>
            Define Route
          </button>
          <select className="route-select" value={route} onChange={handleRouteChange}>
            <option value="">Select Route</option>
            <option value="route1">Route 1</option>
            <option value="route2">Route 2</option>
            <option value="route3">Route 3</option>
          </select>
          <button className="start-stop-button" onClick={handleDriveStop}>
            {isDriving ? "Stop" : "Drive"}
          </button>
        </div>
        <div className="direction-buttons-container">
          <div className="direction-button-up">
            <button
              className={`start-stop-button up ${direction === "up" ? "active" : ""}`}
            >
              ↑
            </button>
          </div>
          <div className="direction-buttons">
            <button
              className={`start-stop-button left ${direction === "left" ? "active" : ""}`}
            >
              ←
            </button>
            <button
              className={`start-stop-button down ${direction === "down" ? "active" : ""}`}
            >
              ↓
            </button>
            <button
              className={`start-stop-button right ${direction === "right" ? "active" : ""}`}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="mbot-image-container">
        {direction ? (
          <img src={require(`../Images/${direction}.png`)} alt={`Robot facing ${direction}`} />
        ) : (
          <img src={require(`../Images/up.png`)} alt={`Robot facing ${direction}`} />
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
