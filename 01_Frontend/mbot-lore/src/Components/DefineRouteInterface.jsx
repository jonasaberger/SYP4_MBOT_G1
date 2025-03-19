import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import "./css/DefineRouteInterface.css";

const DefineRouteInterface = ({ onClose }) => {
  const [ledOn, setLedOn] = useState(false);
  const [color, setColor] = useState("#ff0000");
  const [checkpoints, setCheckpoints] = useState([]);
  const [length, setLength] = useState("");
  const [speed, setSpeed] = useState(50);
  const [direction, setDirection] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [value, setValue] = useState(50);

  useEffect(() => {
    updateSliderBackground(value);
  }, [value]);

  const addCheckpoint = () => {
    const newCheckpoint = `Checkpoint ${checkpoints.length + 1}`;
    setCheckpoints([...checkpoints, newCheckpoint]);
  };

  const removeCheckpoint = (index) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index));
  };

  const toggleSwitch = () => {
    setLedOn(!ledOn);
  };

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  const handleColorSubmit = () => {
    console.log("LED Color:", color);
    setShowColorPicker(false);
    // Hier können Sie den Befehl zum Setzen der LED-Farbe senden
  };

  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
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
    setTimeout(() => {
      //sendCommand("speed", e.target.value.toString());
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Define Route</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <label>Length:</label>
          <input className="border ml-2" value={length} onChange={(e) => setLength(e.target.value)} />
          
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
          <input className="border ml-2" value={direction} onChange={(e) => setDirection(e.target.value)} />
          
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
          <div className="bg-purple-100 text-black p-4 mt-4 rounded-md">
            {checkpoints.map((cp, index) => (
              <div key={index} className="flex justify-between p-2 border-b">
                <span>{cp}</span>
                <button onClick={() => removeCheckpoint(index)}>🗑</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DefineRouteInterface;