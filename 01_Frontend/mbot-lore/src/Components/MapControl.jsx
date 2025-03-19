import React, { useState, useEffect } from "react";
import "./css/Manual.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";

const ControlPanel = () => {
  const [direction, setDirection] = useState(null);
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [route, setRoute] = useState("");
  const [value, setValue] = useState(50);
  const [isOn, setIsOn] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleStartStop = () => {
    setIsDriving((prev) => !prev); // Toggle zwischen Drive und Stop
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  return (
    <div className="control-panel">
      <div className="left-container">
        <button className="start-stop-button" onClick={handleStartStop}>
          {isDriving ? "Stop" : "Drive"}
        </button>
        <div className="led-container">
          <span className="led-label">LED</span>
          <div className={`toggle-switch ${isOn ? "on" : "off"}`} onClick={toggleSwitch}>
            <div className="toggle-handle"></div>
          </div>
          <div className={`led-indicator ${isOn ? "led-on" : "led-off"}`}></div>
        </div>
        <div className="direction-button-up">
          <button
            className={`start-stop-button up ${direction === "forward" ? "active" : ""}`}
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
            className={`start-stop-button down ${direction === "backward" ? "active" : ""}`}
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

      <div className="mbot-image-container">
        {direction ? (
          <img src={require(`../Images/${direction}.png`)} alt={`Robot facing ${direction}`} />
        ) : (
          <img src={require(`../Images/forward.png`)} alt={`Robot facing ${direction}`} />
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
        speed={runtime} //Placeholder bis Speed Funktionalität eingebaut wird
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ControlPanel;
