import React, { useState, useEffect } from "react";
import "./css/Automatic.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import DefineRouteInterface from "./DefineRouteInterface";
import "./css/DefineRouteInterface.css";
import { getRoutes, sendCommand, sendEndRouteCommand } from "../API_Service/service";

const ControlPanel = () => {
  const [direction, setDirection] = useState("forward");
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [route, setRoute] = useState("");
  const [showDefineRoute, setShowDefineRoute] = useState(false);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routesData = await getRoutes();
        setRoutes(routesData);
      } catch (error) {
        console.error("Fehler beim Abrufen der Routen:", error);
      }
    };

    fetchRoutes();
  }, []);

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

  const handleRouteChange = (event) => {
    setRoute(event.target.value);
  };

  const handleDriveStop = async () => {
    setIsDriving((prev) => !prev); // Toggle zwischen Drive und Stop
    if (!isDriving && route) {
      try {
        await sendCommand("route", route);
        console.log(`Route ${route} gestartet`);
      } catch (error) {
        console.error("Fehler beim Starten der Route:", error);
      }
    } else if (isDriving) {
      try {
        console.log("Drive stoppen");
        await sendEndRouteCommand();
        console.log("Drive gestoppt");
      } catch (error) {
        console.error("Fehler beim Stoppen der Route:", error);
      }
    }
  };

  const handleDefineRoute = () => {
    setShowDefineRoute(true);
  };

  const handleMove = (dir) => {
    setDirection(dir);
    setDistance((prev) => prev + 1);
    setRuntime((prev) => prev + 1);
  };

  return (
    <div className="control-panel">
      <div className="left-container">
        <div className="control-buttons">
          <button className="define-route-button" onClick={handleDefineRoute}>
            Define Route
          </button>
          <select
            className="route-select"
            value={route}
            onChange={handleRouteChange}
            disabled={isDriving} // Dropdown deaktivieren, wenn eine Route aktiv ist
          >
            <option value="" disabled>
              Select Route
            </option>
            {routes.map((routeName) => (
              <option key={routeName} value={routeName}>
                {routeName}
              </option>
            ))}
          </select>
          <button className="start-stop-button" onClick={handleDriveStop}>
            {isDriving ? "Stop" : "Drive"}
          </button>
        </div>
        <div className="direction-buttons-container">
          <div className="direction-button-up">
            <button
              className={`start-stop-button up ${direction === "up" ? "active" : ""}`}
              onClick={() => handleMove("up")}
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
              className={`start-stop-button down ${direction === "down" ? "active" : ""}`}
              onClick={() => handleMove("down")}
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

      <div className="robot-placeholder">
        {console.log(`Robot is moving ${direction}`)}
        {direction ? (
          <img src={require(`../Images/${direction}.png`)} alt={`Robot facing ${direction}`} />
        ) : (
          "Robot Placeholder"
        )}
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
        speed={runtime} //Placeholder bis Speed Funktionalität eingebaut wird
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
      {showDefineRoute && <DefineRouteInterface onClose={() => setShowDefineRoute(false)} />}
    </div>
  );
};

export default ControlPanel;