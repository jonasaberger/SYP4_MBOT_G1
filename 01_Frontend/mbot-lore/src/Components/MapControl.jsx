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
  const [mapPoints, setMapPoints] = useState([
    [1, 43.2, 67],
    [2, 27.6, 190],
    [3, 85.9, 32],
    [4, 19.4, 270],
    [5, 63.0, 120],
    [6, 38.7, 45],
    [7, 52.1, 88],
    [8, 72.3, 15],
    [9, 94.5, 210],
    [10, 28.1, 300],
    [11, 56.7, 90],
    [12, 34.2, 180],
    [13, 67.8, 45],
    [14, 42.5, 135],
    [15, 89.3, 225],
    [16, 23.7, 315],
    [17, 51.2, 22],
    [18, 76.4, 158],
    [19, 39.8, 270],
    [20, 62.1, 95],
    [21, 47.6, 40],
    [22, 83.2, 130],
    [23, 29.5, 200],
    [24, 58.7, 350],
    [25, 35.4, 80],
    [26, 71.9, 160],
    [27, 44.3, 240],
    [28, 92.6, 20],
    [29, 26.8, 100],
    [30, 53.4, 280],
    [31, 78.1, 60],
    [32, 37.9, 140],
    [33, 65.2, 220],
    [34, 48.5, 300],
    [35, 32.6, 110],
    [36, 59.3, 190],
    [37, 45.8, 270],
    [38, 74.2, 50],
    [39, 41.7, 130],
    [40, 68.9, 210],
    [41, 54.6, 290],
    [42, 87.3, 70],
    [43, 36.4, 150],
    [44, 63.8, 230],
    [45, 49.1, 310],
    [46, 79.5, 10],
    [47, 43.9, 90],
    [48, 72.6, 170],
    [49, 57.3, 250],
    [50, 84.2, 330],
    [51, 38.7, 40],
    [52, 66.4, 120],
    [53, 52.9, 200],
    [54, 81.1, 280],
    [55, 46.5, 60],
    [56, 73.8, 140],
    [57, 58.2, 220],
    [58, 86.7, 300],
    [59, 41.3, 80],
    [60, 69.5, 160],
    [61, 54.8, 240],
    [62, 47.1, 100],
    [63, 75.9, 180],
    [64, 61.4, 260],
    [65, 89.2, 340],
    [66, 44.7, 20],
    [67, 72.3, 100],
    [68, 57.6, 180],
    [69, 85.1, 260],
    [70, 49.8, 40],
    [71, 77.4, 120],
    [72, 62.9, 200],
    [73, 91.5, 280],
    [74, 46.2, 60],
    [75, 59.3, 220],
    [76, 87.9, 300],
    [77, 52.6, 80],
    [78, 80.2, 160],
    [79, 65.7, 240],
    [80, 94.3, 320],
    [81, 48.9, 100],
    [82, 76.5, 180],
    [83, 61.8, 260],
    [84, 89.4, 340],
    [85, 54.1, 20],
    [86, 81.7, 100],
    [87, 67.2, 180],
    [88, 95.8, 260],
    [89, 50.5, 40],
    [90, 78.1, 120],
    [91, 63.6, 200],
    [92, 92.2, 280],
    [93, 56.9, 60],
    [94, 84.5, 140],
    [95, 69.8, 220],
    [96, 97.4, 300],
    [97, 61.7, 80],
    [98, 40.2, 150],
    [99, 72.5, 210],
    [100, 53.9, 270],
    [101, 38.1, 60],
    [102, 64.8, 120],
    [103, 79.2, 180],
    [104, 47.5, 240],
    [105, 92.4, 300],
    [106, 29.3, 360],
    [107, 58.6, 90],
    [108, 82.7, 170],
    [109, 37.4, 230],
    [110, 71.2, 310],
    [111, 66.1, 20],
    [112, 34.8, 80],
    [113, 56.4, 160],
    [114, 71.0, 240],
    [115, 80.4, 320],
    [116, 41.1, 50],
    [117, 65.0, 130],
    [118, 49.7, 210],
    [119, 92.9, 290],
    [120, 73.6, 70],
    [121, 51.4, 150],
    [122, 86.3, 230],
    [123, 77.8, 310],
    [124, 68.2, 20],
    [125, 85.0, 100],
    [126, 90.3, 180],
    [127, 46.3, 260],
    [128, 64.5, 340],
    [129, 79.4, 50],
    [130, 92.8, 130],
    [131, 54.0, 210],
    [132, 39.5, 290],
    [133, 87.1, 70],
    [134, 63.2, 150],
    [135, 81.9, 230],
    [136, 66.8, 310],
    [137, 41.2, 20],
    [138, 70.3, 100],
    [139, 79.1, 180],
    [140, 94.7, 260],
    [141, 37.3, 340],
    [142, 58.9, 60],
    [143, 72.0, 140],
    [144, 51.6, 220],
    [145, 40.7, 300],
    [146, 87.5, 80],
    [147, 79.0, 160],
    [148, 64.1, 240],
    [149, 75.4, 320],
    [150, 90.2, 50]
  ]);  
  const [mapWidth, setMapWidth] = useState(300); // Beispielbreite der Karte
  const [mapHeight, setMapHeight] = useState(150); // Beispielhöhe der Karte
   

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

      {showPopup && (
     <MapPopup
        onClose={handleClosePopup}
        points={mapPoints}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
    />
)}

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