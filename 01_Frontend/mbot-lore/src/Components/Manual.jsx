import React, { useState } from "react";
import "./css/Manual.css";
import InfoPanel from "./InfoPanel";
import { useEffect } from "react";


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

  const handleDriveStop = () => {
    setIsDriving((prev) => !prev); // Toggle zwischen Drive und Stop
  };

  const [value, setValue] = useState(50);

  useEffect(() => {
    updateSliderBackground(value);
  }, [value]);

  const updateSliderBackground = (val) => {
    const slider = document.getElementById("slider");
    const percentage = ((val - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #016E8F ${percentage}%, #ddd ${percentage}%)`;
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  return (
    <div className="control-panel">
        <div className="manual-controls">
            <div className="control-buttons">
                <button className="control-button" onClick={handleDriveStop}>
                    {isDriving ? "Stop" : "Drive"}
                </button>
            </div>
            <div>
            <div className="speed-slider-container">
                <input
                    className="speed-slider"
                    id="slider"
                    type="range"
                    min="1"
                    max="100"
                    value={value}
                    onChange={handleChange}
                />
            </div>
            <div className="led-container">
                <span className="led-label">LED</span>
                <div className={`toggle-switch ${isOn ? "on" : "off"}`} onClick={toggleSwitch}>
                    <div className="toggle-handle"></div>
                </div>
                <button type="button" className="led-color-button"></button>
            </div>
        </div>
        <div className="direction-button-up">
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
