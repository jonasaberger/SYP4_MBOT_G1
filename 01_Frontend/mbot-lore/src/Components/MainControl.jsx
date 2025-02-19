import React, { useState } from "react";
import AutomaticControl from "./Automatic";
import ManualControl from "./Manual";
import MapControl from "./MapControl";
import "./css/MainControl.css";

const MainControl = () => {
  const [mode, setMode] = useState("manual");

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const renderComponent = () => {
    switch (mode) {
      case "manual":
        return <ManualControl/>;
       break;
      case "map":
        return <MapControl />;
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
        <button className={`manual ${mode === "manual" ? "active" : ""}`} onClick={() => handleModeChange("manual")} >Manual</button>
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
