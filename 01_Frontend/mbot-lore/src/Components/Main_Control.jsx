import React, { useState } from "react";
//import ManualControl from "./ControlPanel";
import AutomaticControl from "./Automatic_Drive_Component";
import "./css/Main_control.css";

const MainControl = () => {
  const [mode, setMode] = useState("automatic");
  

  const handleModeChange = (newMode) => {
    getMode(newMode)
    setMode(newMode);
  };

  const getMode=() => {
    return mode;
  }
  const renderComponent = () => {
    switch (mode) {
      case "manual":
       // return <ManualControl/>;
       break;
      case "map":
        //return <MapView />;
        break;
      case "automatic":
      default:
        return <AutomaticControl />;
    }
  };

  return (
    <div className="main-control">
      <h1 className="title">Control</h1>
      <div className="mode-buttons">
        <button className={`manual ${mode === "manual" ? "active" : ""}`} onClick={() => handleModeChange("manual")}>Manual</button>
        <button className={`automatic ${mode === "automatic" ? "active" : ""}`} onClick={() => handleModeChange("automatic")}>Automatic</button>
        <button className={`map ${mode === "map" ? "active" : ""}`} onClick={() => handleModeChange("map")}>Map</button>
      </div>
      <div className="control-section">
        {renderComponent()}
      </div>
    </div>
  );
};

export default MainControl;
