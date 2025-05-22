import React, { useState, useEffect, useRef } from "react";
import "./css/MapControl.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import { SketchPicker } from "react-color";
import { getDiscoveryPoints, sendCommand } from "../API_Service/service";
import MapPopup from "./MapPopup";

const ControlPanel = () => {
  // State variables
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [isOn, setIsOn] = useState(false);
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledColorString, setLedColorString] = useState("255,255,255");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [mapSize, setMapSize] = useState({
    width: Math.min(window.innerWidth * 0.8, 800),
    height: Math.min(window.innerHeight * 0.6, 500)
  });
  const [notification, setNotification] = useState(null);
  const commandCount = useRef(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setMapSize({
        width: Math.min(window.innerWidth * 0.8, 800),
        height: Math.min(window.innerHeight * 0.6, 500)
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const closeNotification = () => setNotification(null);

  // Handle start/stop command
  const handleStartStop = async () => {
    try {
      const command = commandCount.current % 2 === 0 ? "start" : "stop";
      commandCount.current += 1;

      await sendCommand("drive", command);

      if (command === "stop") {
        try {
          const points = await getDiscoveryPoints();
          console.log("Received points data:", points);

          // Convert points to proper format
          const formattedPoints = convertPointsData(points);
          
          if (formattedPoints.length > 0) {
            setMapPoints(formattedPoints);
          } else {
            // No valid points received - will use test data in MapPopup
            setMapPoints([]);
            setNotification({
              type: "warning",
              message: "No valid data received - showing test map"
            });
          }
          setShowPopup(true);
        } catch (error) {
          console.error("Error loading points:", error);
          // On error - will use test data in MapPopup
          setMapPoints([]);
          setShowPopup(true);
          setNotification({
            type: "warning",
            message: "Error loading data - showing test map"
          });
        }
      }
    } catch (error) {
      console.error("Command error:", error);
      setNotification({
        type: "error",
        message: "Error sending command!"
      });
    }
  };

  // Convert points data to proper format
  const convertPointsData = (points) => {
    if (!Array.isArray(points)) return [];
    
    return points.map((point, index) => {
      // Array format [id, distance, angle]
      if (Array.isArray(point) && point.length >= 3) {
        return {
          id: Number(point[0]) || index,
          distance: Number(point[1]) || 0,
          angle: Number(point[2]) || 0
        };
      }
      // Object format {id, distance, angle}
      else if (typeof point === 'object' && point !== null) {
        return {
          id: Number(point.id) || index,
          distance: Number(point.distance) || 0,
          angle: Number(point.angle) || 0
        };
      }
      // Invalid format
      return {
        id: index,
        distance: 0,
        angle: 0
      };
    }).filter(Boolean); // Remove null values
  };

  // Handle movement commands
  const handleMove = async (newDirection) => {
    try {
      setDirection(newDirection);
      await sendCommand("direction", newDirection);
      setNotification({ 
        type: "info", 
        message: `Direction changed: ${newDirection}` 
      });
    } catch (error) {
      console.error("Direction error:", error);
      setNotification({ 
        type: "error", 
        message: "Error changing direction!" 
      });
    }
  };

  // Toggle LED on/off
  const toggleSwitch = async () => {
    try {
      const newState = !isOn;
      setIsOn(newState);
      await sendCommand("led", newState ? "on" : "off");
      setNotification({ 
        type: "info", 
        message: `LED ${newState ? "on" : "off"}` 
      });
    } catch (error) {
      console.error("LED toggle error:", error);
      setIsOn(prev => !prev); // Revert state
      setNotification({ 
        type: "error", 
        message: "Error toggling LED!" 
      });
    }
  };

  // Color picker controls
  const toggleColorPicker = () => setShowColorPicker((prev) => !prev);

  const handleColorChange = (color) => {
    setLedColor(color.hex);
    const { r, g, b } = color.rgb;
    setLedColorString(`${r},${g},${b}`);
  };

  const handleColorSubmit = async () => {
    try {
      await sendCommand("color", ledColorString);
      setShowColorPicker(false);
      setNotification({ 
        type: "success", 
        message: "LED color set!" 
      });
    } catch (error) {
      console.error("Color set error:", error);
      setNotification({ 
        type: "error", 
        message: "Error setting color!" 
      });
    }
  };

  return (
    <div className="control-panel">
      {notification && (
        <div className={`notification ${notification.type}`} onClick={closeNotification}>
          {notification.message}
        </div>
      )}

      <div className="left-container">
        <div className="control-buttons">
          <button className="control-button start-stop-btn" onClick={handleStartStop}>
            {commandCount.current % 2 === 0 ? "Start" : "Stop"}
          </button>
        </div>

        <div className="led-container">
          <span className="led-label">LED</span>
          <div
            className={`toggle-switch ${isOn ? "on" : "off"}`}
            onClick={toggleSwitch}
          >
            <div className="toggle-handle"></div>
          </div>
          <div className="led-color-picker-container">
            <div
              className="led-color-picker-toggle"
              onClick={toggleColorPicker}
            >
              <div
                className="led-indicator"
                style={{ backgroundColor: ledColor }}
              ></div>
            </div>
            {showColorPicker && (
              <div className="led-color-picker">
                <SketchPicker color={ledColor} onChange={handleColorChange} />
                <button
                  className="control-button color-submit-button"
                  onClick={handleColorSubmit}
                >
                  Set Color
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="direction-buttons-container">
          <div className="direction-button-up">
            <button
              className={`control-button direction-btn up ${
                direction === "forward" ? "active" : ""
              }`}
              onClick={() => handleMove("forward")}
            >
              ↑
            </button>
          </div>
          <div className="direction-buttons-middle">
            <button
              className={`control-button direction-btn left ${
                direction === "left" ? "active" : ""
              }`}
              onClick={() => handleMove("left")}
            >
              ←
            </button>
            <button
              className={`control-button direction-btn down ${
                direction === "backward" ? "active" : ""
              }`}
              onClick={() => handleMove("backward")}
            >
              ↓
            </button>
            <button
              className={`control-button direction-btn right ${
                direction === "right" ? "active" : ""
              }`}
              onClick={() => handleMove("right")}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="robot-placeholder">
        <img
          src={require(`../Images/${direction}.png`)}
          alt={`Robot moving ${direction}`}
          className="robot-image"
        />
      </div>

      {showPopup && (
        <MapPopup
          onClose={() => setShowPopup(false)}
          points={mapPoints} // Empty array will trigger test data in MapPopup
          mapWidth={mapSize.width}
          mapHeight={mapSize.height}
        />
      )}

      {isCollapsed && (
        <button className="reveal-info-button" onClick={toggleCollapse}>
          ◁
        </button>
      )}

      <InfoPanel
        distance={distance}
        runtime={runtime}
        value={50}
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ControlPanel;