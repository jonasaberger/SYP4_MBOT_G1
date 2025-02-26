import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import "./css/Manual.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import { sendCommand, startDriveSequence } from "../API_Service/service";

const ControlPanel = () => {
  const [direction, setDirection] = useState(null);
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [value, setValue] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledColorString, setLedColorString] = useState("255,255,255");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleMove = async (dir) => {
    setDirection(dir);
    setDistance((prev) => prev + 1);
    setRuntime((prev) => prev + 1);
    const commandString = `control_${dir}_${value}`;
    console.log(commandString);
    await sendCommand("drive", dir);  // Hier wird die Richtung mitgegeben (forward, backward, etc.)
    await sendCommand("speed", value);  // Geschwindigkeit wird gesetzt
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleMoveStop = async () => {
    setDirection(null);
    const commandString = `control_Stop_${value}`;
    await sendCommand("drive", "stop");  // "stop"-Befehl senden
    await sendCommand("speed", value);  // Geschwindigkeit wird weiter gesetzt
  };

  const handleStartStop = async () => {
    setIsDriving((prev) => !prev);
    const commandString = `control_${isDriving ? "Stop" : "Forward"}_${value}`;
    
    // Starte die Drive-Sequence (stellt sicher, dass IP und Mode zuerst gesetzt sind)
    await startDriveSequence(isDriving ? "stop" : "drive");
    await sendCommand("speed", value);  // Geschwindigkeit wird gesetzt
  };

  useEffect(() => {
    updateSliderBackground(value);
  }, [value]);

  const updateSliderBackground = (val) => {
    const slider = document.getElementById("slider");
    if (slider) {
      const percentage = ((val - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = `linear-gradient(to right, #016E8F ${percentage}%, #ddd ${percentage}%)`;
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  const handleColorChange = (color) => {
    setLedColor(color.hex);
    const rgb = color.rgb;
    setLedColorString(`${rgb.r},${rgb.g},${rgb.b}`);
  };

  const handleColorSubmit = () => {
    console.log("LED Color:", ledColorString);
    setShowColorPicker(false);
    sendCommand("color", ledColorString); // LED-Farbe setzen
  };

  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
  };

  return (
    <div className="control-panel">
      <div className="left-container">
        <button className="start-stop-button" onClick={handleStartStop}>
          {isDriving ? "Stop" : "Drive"}
        </button>
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
          <div className="led-color-picker-container">
            <div className="led-color-picker-toggle" onClick={toggleColorPicker}>
              <div className="led-indicator" style={{ backgroundColor: ledColor }}></div>
            </div>
            {showColorPicker && (
              <div className="led-color-picker">
                <SketchPicker color={ledColor} onChange={handleColorChange} />
                <button className="color-submit-button" onClick={handleColorSubmit}>
                  Set Color
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="direction-button-up">
          <button
            className={`start-stop-button up ${direction === "up" ? "active" : ""}`}
            onClick={() => handleMove("up")}
            onMouseLeave={handleMoveStop}
          >
            ↑
          </button>
        </div>
        <div className="direction-buttons">
          <button
            className={`start-stop-button left ${direction === "left" ? "active" : ""}`}
            onClick={() => handleMove("left")}
            onMouseLeave={handleMoveStop}
          >
            ←
          </button>
          <button
            className={`start-stop-button down ${direction === "down" ? "active" : ""}`}
            onClick={() => handleMove("down")}
            onMouseLeave={handleMoveStop}
          >
            ↓
          </button>
          <button
            className={`start-stop-button right ${direction === "right" ? "active" : ""}`}
            onClick={() => handleMove("right")}
            onMouseLeave={handleMoveStop}
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
      {isCollapsed && (
        <button className="reveal-info-button" onClick={toggleCollapse}>
          ◁
        </button>
      )}
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
