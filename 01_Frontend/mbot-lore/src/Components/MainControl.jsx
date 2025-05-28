import React, { useState, useEffect, useRef } from "react";
import AutomaticControl from "./Automatic";
import ManualControl from "./Manual";
import MapControl from "./MapControl";
import { sendCommand } from "../API_Service/service";
import "./css/MainControl.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logout } from "../API_Service/service";
import { useNavigate } from "react-router-dom";
import { FaMap, FaCar, FaRobot } from "react-icons/fa";

const MainControl = () => {
  const [mode, setMode] = useState("manual");
  const isChangingMode = useRef(false);
  const hasInitialized = useRef(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (!hasInitialized.current) {
      sendCommand("mode", "controller")
        .then(() => console.log("Initial mode set to controller"))
        .catch((error) => console.error("Fehler beim Setzen des Modus:", error));
      hasInitialized.current = true;
    }
    // Responsive check
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleModeChange = async (newMode, event) => {
    if (event) event.preventDefault();
    if (isChangingMode.current || newMode === mode) {
      console.log("Moduswechsel blockiert oder Modus bereits aktiv.");
      return;
    }
    isChangingMode.current = true;
    try {
      console.log(`Wechsle Modus zu: ${newMode}`);
      await sendCommand("mode", "exit");
      if (newMode === "manual") {
        await sendCommand("mode", "controller");
      } else if (newMode === "map") {
        await sendCommand("mode", "discovery");
      } else if (newMode === "automatic") {
        await sendCommand("mode", "automatic");
      }
      setMode(newMode);
      console.log(`Modus erfolgreich gewechselt zu: ${newMode}`);
    } catch (error) {
      console.error("Fehler beim Wechseln des Modus:", error);
    } finally {
      isChangingMode.current = false;
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

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
    console.log("Benutzer abgemeldet");
  }

  return (
    <div className="main-control">
      <div className="title-container">
        <h1 className="title">Control</h1>
        <button className="signout-button" onClick={handleSignOut} style={{ fontSize: '34px' }}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
      
      <div className="mode-buttons">
        <button
          className={`manual ${mode === "manual" ? "active" : ""}`}
          onClick={(event) => handleModeChange("manual", event)}
          title="Manual"
        >
          {isMobile ? <span className="icon"><FaCar /></span> : "Manual"}
        </button>
        <button
          className={`automatic ${mode === "automatic" ? "active" : ""}`}
          onClick={(event) => handleModeChange("automatic", event)}
          title="Automatic"
        >
          {isMobile ? <span className="icon"><FaRobot /></span> : "Automatic"}
        </button>
        <button
          className={`map ${mode === "map" ? "active" : ""}`}
          onClick={(event) => handleModeChange("map", event)}
          title="Map"
        >
          {isMobile ? <span className="icon"><FaMap /></span> : "Map"}
        </button>
      </div>
      <div className="control-section">{renderComponent()}</div>
    </div>
  );
};

export default MainControl;
