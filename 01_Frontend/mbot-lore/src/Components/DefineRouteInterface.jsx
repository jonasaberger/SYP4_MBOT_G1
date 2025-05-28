import React, { useState, useEffect, useRef } from "react";
import { SketchPicker } from "react-color";
import "./css/DefineRouteInterface.css";
import SaveDefinedRoutePopup from "./SaveDefinedRoutePopup";
import {sendDefinedRoute} from "../API_Service/service";
 
const DefineRouteInterface = ({ onClose }) => {
  const [ledOn, setLedOn] = useState(false);
  const [color, setColor] = useState("rgb(255, 0, 0)");
  const [checkpoints, setCheckpoints] = useState([]);
  const [duration, setDuration] = useState("");
  const [speed, setSpeed] = useState(50);
  const [direction, setDirection] = useState("forward");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [value, setValue] = useState(50);
  const lastCheckpointRef = useRef(null);
  const canvasRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
 
  useEffect(() => {
    updateSliderBackground(value);
  }, [value]);
 
  useEffect(() => {
    if (lastCheckpointRef.current) {
      lastCheckpointRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [checkpoints]);
 
  const addCheckpoint = () => {
    if (duration !== "") {
      const newCheckpoint = {
        duration: parseInt(duration, 10),
        speed: parseInt(speed, 10),
        direction,
        color: ledOn ? color : "rgb(0, 0, 0)",
      };
      const formattedCheckpoint = `Duration: ${newCheckpoint.duration}\nSpeed: ${newCheckpoint.speed}\nDirection: ${newCheckpoint.direction}\nColor: ${newCheckpoint.color}`;
      setCheckpoints([...checkpoints, newCheckpoint ]);
    }
  };
 
  const removeCheckpoint = (index) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index));
  };
 
  const toggleSwitch = () => {
    setLedOn(!ledOn);
  };
 
  const handleColorChange = (color) => {
    const { r, g, b } = color.rgb;
    setColor(`rgb(${r}, ${g}, ${b})`);
  };
 
  const handleColorSubmit = () => {
    setShowColorPicker(false);
  };
 
  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
  };
 
  const handleSave = () => {
    setShowPopup(true);
  };
 
  const sendData = async (routeName) => {
    const formattedCheckpoints = checkpoints.map((checkpoint) => ({
      direction: checkpoint.direction,
      speed: checkpoint.speed.toString(),
      duration: checkpoint.duration,
      color: checkpoint.color.replace("rgb(", "").replace(")", ""),
    }));
 
    await sendDefinedRoute(routeName, formattedCheckpoints);
  };
 
  const updateSliderBackground = (val) => {
    const slider = document.getElementById("slider");
    if (slider) {
      const percentage = ((val - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = `linear-gradient(to right, #016E8F ${percentage}%, #ddd ${percentage}%)`;
    }
  };
 
  const handleChange = (e) => {
    setValue(e.target.value.toString());
    setSpeed(e.target.value);
  };
 
  const handleDirectionChange = (e) => {
    setDirection(e.target.value);
  };
 
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Define Route</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="input-section">
            <label>Duration (sec):</label>
            <input className="border ml-2" value={duration} onChange={(e) => setDuration(e.target.value)} />
           
            <label className="block mt-2">Speed:</label>
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
           
            <label className="block mt-2">Direction:</label>
            <select className="direction-select" value={direction} onChange={handleDirectionChange}>
              <option value="forward">Forward</option>
              <option value="backward">Backward</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="stop">Pause</option>
            </select>
           
            <div className="led-container">
              <span className="led-label">LED</span>
              <div className={`toggle-switch ${ledOn ? "on" : "off"}`} onClick={toggleSwitch}>
                <div className="toggle-handle"></div>
              </div>
              <div className="led-color-picker-container">
                <div className="led-color-picker-toggle" onClick={toggleColorPicker}>
                  <div className="led-indicator" style={{ backgroundColor: color }}></div>
                </div>
                {showColorPicker && (
                  <div className="led-color-picker">
                    <SketchPicker color={color} onChange={handleColorChange} />
                    <button className="color-submit-button" onClick={handleColorSubmit}>
                      Set Color
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={addCheckpoint} className="new-checkpoint-button">New Checkpoint</button>
          </div>
          <div className="checkpoints-and-save">
            <div className="checkpoints-section">
              {checkpoints.map((cp, index) => (
                <div key={index} className="checkpoint" ref={index === checkpoints.length - 1 ? lastCheckpointRef : null}>
                  <span>Duration: {cp.duration}<br></br>Speed: {cp.speed}<br></br>Direction: {cp.direction}<br></br>Color: {cp.color}</span>
                  <button onClick={() => removeCheckpoint(index)}>🗑</button>
                </div>
              ))}
            </div>
            <div className="save-button-container">
                <button className="save-button" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
  <SaveDefinedRoutePopup
    onClose={() => setShowPopup(false)}
    onSave={(routeName) => {
      sendData(routeName);
      setShowPopup(false);
      onClose();
    }}
  />
)}
    </div>
  );
};

export default DefineRouteInterface;