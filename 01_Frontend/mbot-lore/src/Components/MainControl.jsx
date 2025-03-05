import React, { useState, useEffect, useRef } from "react";
import AutomaticControl from "./Automatic";
import ManualControl from "./Manual";
import MapControl from "./MapControl";
import { sendCommand } from "../API_Service/service";
import "./css/MainControl.css";

const MainControl = () => {
  const [mode, setMode] = useState("manual");
  const isChangingMode = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      sendCommand("mode", "controller");
      hasInitialized.current = true;
    }
  }, []);

  const handleModeChange = async (newMode, event) => {
    event.preventDefault();
    if (isChangingMode.current || newMode === mode) {
      return;
    }

    isChangingMode.current = true;

    try {
      await sendCommand("mode", "exit");
      if (newMode === "manual") {
        await sendCommand("mode", "controller");
      } else if (newMode === "map") {
        await sendCommand("mode", "discovery");
      } else if (newMode === "automatic") {
        await sendCommand("mode", "automatic");
      }
      setMode(newMode);
    } finally {
      setTimeout(() => {
        isChangingMode.current = false;
      }, 500);
    }
  };

  const renderComponent = () => {
    switch (mode) {
      case "manual":
        return <ManualControl />;
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
        <button
          className={`manual ${mode === "manual" ? "active" : ""}`}
          onClick={(event) => handleModeChange("manual", event)}
        >
          Manual
        </button>
        <button
          className={`automatic ${mode === "automatic" ? "active" : ""}`}
          onClick={(event) => handleModeChange("automatic", event)}
        >
          Automatic
        </button>
        <button
          className={`map ${mode === "map" ? "active" : ""}`}
          onClick={(event) => handleModeChange("map", event)}
        >
          Map
        </button>
      </div>
      <div className="control-section">{renderComponent()}</div>
    </div>
  );
};

export default MainControl;