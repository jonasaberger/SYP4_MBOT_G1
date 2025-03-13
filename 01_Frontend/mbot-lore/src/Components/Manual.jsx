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
  const [value, setValue] = useState(50); // Speed value
  const [isOn, setIsOn] = useState(false); // LED toggle
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledColorString, setLedColorString] = useState("255,255,255");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [sentDirection, setSentDirection] = useState(false);
  let sendStop = true;

  // Funktion zum Bewegen des Roboters in eine bestimmte Richtung
  const handleMove = async (dir) => {
    setDirection(dir);
    const commandString = `control_${dir}_${value}`;
    console.log(commandString);
    // Senden des Steuerbefehls für die Richtung (forward, backward, etc.)
    await sendCommand("speed", value.toString());  // Geschwindigkeit wird gesetzt
    await sendCommand("drive", dir);  // Hier wird die Richtung mitgegeben (forward, backward, etc.)
  };

  // Zusammenklappen oder Ausklappen des Info-Panels
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Funktion zum Stoppen der Bewegung
  const handleMoveStop = async () => {
    setDirection(null);
    const commandString = `control_Stop_${value}`;
    await sendCommand("drive", "stop");  // "stop"-Befehl senden
  };

  // Starten oder Stoppen des Fahrens
  const handleStartStop = async () => {
    setIsDriving((prev) => !prev);
    const commandString = `control_${isDriving ? "Stop" : "Forward"}_${value}`;
    
    // Starte die Drive-Sequence (stellt sicher, dass IP und Mode zuerst gesetzt sind)
    await startDriveSequence(isDriving ? "stop" : "start");
    await sendCommand("speed", value.toString());  
  };

  // Aktualisieren der Hintergrundfarbe des Speed-Sliders
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

  // Verarbeiten der Slideränderung
  const handleChange = (e) => {
    setValue(e.target.value.toString());
    setTimeout(() => {
      sendCommand("speed", e.target.value.toString());
    },1000);
  };

  // Umschalten des LED-Status
  const toggleSwitch = () => {
    setIsOn(!isOn);
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

  // Umschalten des Color Pickers
  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
  };

  // Tasteneingaben für Bewegung und Steuerung
  useEffect(() => {
    const handleKeyDown = (event) => {
      sendStop = true;
      setPressedKeys((prevKeys) => new Set(prevKeys).add(event.key));
      if (!sentDirection) {
        switch (event.key) {
          case "ArrowUp":
          case "w":
          case "W":
            console.log("key down");
            handleMove("forward"); 
            setSentDirection(true);
            break;
          case "ArrowLeft":
          case "a":
          case "A":
            handleMove("left");
            setSentDirection(true);
            break;
          case "ArrowDown":
          case "s":
          case "S":
            handleMove("backward");
            setSentDirection(true);
            break;
          case "ArrowRight":
          case "d":
          case "D":
            handleMove("right");
            setSentDirection(true);
            break;
          default:
            break;
        }
      }
    };

    const handleKeyUp = (event) => {
      console.log("key up");
      setSentDirection(false);
      //handleMoveStop();
      setPressedKeys((prevKeys) => {
        const newKeys = new Set(prevKeys);
        newKeys.delete(event.key);
        if (newKeys.size === 0 && sendStop) {
          sendStop = false;
          console.log("stop!!!!!!!!!!!!!!!!")
          setDirection(null);
          handleMoveStop(); // Stoppe Bewegung, wenn keine Taste gedrückt wird
        }
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sentDirection]);

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

      <div className="mbot-image-container">
        {direction ? (
          <img src={require(`../Images/${direction}.png`)} alt={`Robot facing ${direction}`} />
        ) : (
          <img src={require(`../Images/forward.png`)} alt="Robot" />
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
