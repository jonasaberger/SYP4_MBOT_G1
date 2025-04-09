import React, { useState, useEffect } from "react";
import "./css/MapControl.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import { SketchPicker } from "react-color";
import { sendCommand } from "../API_Service/service";
import MapPopup from "./MapPopup";

const ControlPanel = () => {
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [direction, setDirection] = useState('forward'); // Aktuelle Richtung

  const [isOn, setIsOn] = useState(false); // LED toggle
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledColorString, setLedColorString] = useState("255,255,255");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [grid, setGrid] = useState([
    [0, 1, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0],
  ]);

  // Aktualisiere die Laufzeit und Distanz in einem Intervall
  useEffect(() => {
    let interval;
    if (isDriving) {
      interval = setInterval(() => {
        setRuntime((prevRuntime) => prevRuntime + 1); // Erhöhe die Laufzeit um 1 Sekunde
        const speed = 50 * 0.174; // Beispielgeschwindigkeit: 50 (Slider-Wert) * 0.174 m/min
        setDistance((prevDistance) => prevDistance + (speed / 60)); // Erhöhe die Distanz
      }, 1000);
    } else {
      clearInterval(interval); // Stoppe das Intervall, wenn der Roboter nicht fährt
    }

    return () => clearInterval(interval); // Bereinige das Intervall, wenn sich der Zustand ändert
  }, [isDriving]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleStartStop = () => {
    setIsDriving((prev) => !prev); // Umschalten zwischen Fahren und Stoppen
    if (!isDriving) {
      console.log("Fahren gestartet");
    } else {
      setShowPopup(true)
      console.log("Fahren gestoppt");
    }
  };

  const handleMove = (newDirection) => {
    setDirection(newDirection);
    console.log(`Robot bewegt sich in Richtung: ${newDirection}`);
  };

  // Umschalten des LED-Status
  const toggleSwitch = async () => {
    setIsOn(!isOn);
  };

  // Umschalten des Color Pickers
  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
  };
  
  // Verarbeiten der Farbänderung für die LED
  const handleColorChange = (color) => {
    setLedColor(color.hex);
    const rgb = color.rgb;
    setLedColorString(`${rgb.r},${rgb.g},${rgb.b}`);
  };

  // Setzen der LED-Farbe
  const handleColorSubmit = () => {
    console.log("LED Color:", ledColorString);
    setShowColorPicker(false);
    sendCommand("color", ledColorString); // LED-Farbe setzen
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="control-panel">
      <div className="left-container">
        <div className="control-buttons">
          <button className="start-stop-button" onClick={handleStartStop}>
            {isDriving ? "Stop" : "Drive"}
          </button>
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
        <div className="direction-buttons-container">
          <div className="direction-button-up">
            <button
              className={`start-stop-button up ${direction === "forward" ? "active" : ""}`}
              onClick={() => handleMove("forward")}
            >
              ↑
            </button>
          </div>
          <div className="direction-buttons">
            <button
              className={`start-stop-button left ${direction === "left" ? "active" : ""}`}
              onClick={() => handleMove("left")}
            >
              ←
            </button>
            <button
              className={`start-stop-button down ${direction === "backward" ? "active" : ""}`}
              onClick={() => handleMove("backward")}
            >
              ↓
            </button>
            <button
              className={`start-stop-button right ${direction === "right" ? "active" : ""}`}
              onClick={() => handleMove("right")}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="robot-placeholder">
        {console.log(`Robot is moving ${direction}`)}
        {direction ? (
          <img src={require(`../Images/${direction}.png`)} alt={`Robot facing ${direction}`} />
        ) : (
          "Robot Placeholder"
        )}
      </div>

      {showPopup && <MapPopup onClose={handleClosePopup} grid={grid} />}

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
        value={50} // Beispielgeschwindigkeit (kann angepasst werden)
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ControlPanel;