import React, { useState, useEffect } from "react";
import "./css/MapControl.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";

const ControlPanel = () => {
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [direction, setDirection] = useState(null); // Aktuelle Richtung
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
      setDirection("forward"); // Beispiel: Richtung auf "forward" setzen
    } else {
      console.log("Fahren gestoppt");
      setDirection(null); // Richtung zurücksetzen
    }
  };

  const handleMove = (newDirection) => {
    setDirection(newDirection);
    console.log(`Robot bewegt sich in Richtung: ${newDirection}`);
  };

  return (
    <div className="control-panel">
      <div className="left-container">
        <div className="control-buttons">
          <button className="start-stop-button" onClick={handleStartStop}>
            {isDriving ? "Stop" : "Drive"}
          </button>
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