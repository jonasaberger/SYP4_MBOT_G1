import React, { useState } from "react";
import AutomaticControl from "./Automatic";
import ManualControl from "./Manual";
import MapControl from "./MapControl";
import ConnectionComponent from "./Connection";
import "./css/MainControl.css";

const MainControl = () => {
  const [mode, setMode] = useState("manual");
  const [isConnected, setIsConnected] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const renderComponent = () => {
    switch (mode) {
      case "manual":
        return <ManualControl isConnected={isConnected} />;
      case "map":
        return <MapControl />;
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
        {isConnected ? renderComponent() : <ConnectionComponent onConnect={handleConnect} />}
      </div>
    </div>
  );
};

export default MainControl;
