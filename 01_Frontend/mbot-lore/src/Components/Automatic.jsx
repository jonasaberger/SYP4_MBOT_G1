import React, { useState, useEffect } from "react";
import "./css/Automatic.css";
import "./css/sharedStyles.css";
import InfoPanel from "./InfoPanel";
import DefineRouteInterface from "./DefineRouteInterface";
import "./css/DefineRouteInterface.css";
import { deleteRoute, getRoutes, sendCommand, sendEndRouteCommand, getCurrentRoute } from "../API_Service/service";

const ControlPanel = () => {
  const [direction, setDirection] = useState(null); // Visualisierte Richtung
  const [distance, setDistance] = useState(0);
  const [runtime, setRuntime] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDriving, setIsDriving] = useState(false); // Zustand für Drive/Stop Button
  const [route, setRoute] = useState("");
  const [showDefineRoute, setShowDefineRoute] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Zustand für benutzerdefiniertes Dropdown
  const [checkpoints, setCheckpoints] = useState([]); // Liste der Checkpoints
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0); // Aktueller Checkpoint

  // Routen vom Backend abrufen
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

  // Route vom Backend abrufen und Checkpoints setzen
  const fetchRouteDetails = async () => {
    try {
      const routeDetails = await getCurrentRoute(); // Abrufen der Route vom Server
      setCheckpoints(routeDetails); // Setze die Checkpoints
      setCurrentCheckpointIndex(0); // Starte bei Checkpoint 0
    } catch (error) {
      console.error("Fehler beim Abrufen der Route:", error);
    }
  };

  // Laufzeit und Distanz basierend auf der aktuellen Route aktualisieren
  useEffect(() => {
    let interval;
    if (isDriving && checkpoints.length > 0) {
      const { direction, duration } = checkpoints[currentCheckpointIndex];
      setDirection(direction); // Setze die aktuelle Richtung
      interval = setTimeout(() => {
        // Gehe zum nächsten Checkpoint
        if (currentCheckpointIndex < checkpoints.length - 1) {
          setCurrentCheckpointIndex((prevIndex) => prevIndex + 1);
        } else {
          setIsDriving(false); // Stoppe, wenn alle Checkpoints durchlaufen sind
          setDirection(null);
        }
      }, duration * 1000); // Warte die Dauer des aktuellen Checkpoints
    }

    return () => clearTimeout(interval); // Bereinige das Timeout
  }, [isDriving, checkpoints, currentCheckpointIndex]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleRouteChange = (routeName) => {
    setRoute(routeName);
    fetchRouteDetails(); // Lade die Details der ausgewählten Route
  };

  const handleDeleteRoute = async (routeName) => {
    try {
      await deleteRoute(routeName); // Sende den Namen der zu löschenden Route
      console.log(`Route ${routeName} gelöscht`);
      setRoutes((prevRoutes) => prevRoutes.filter((r) => r !== routeName)); // Entferne die Route aus der Liste
      if (route === routeName) setRoute(""); // Setze die aktuelle Route zurück, falls sie gelöscht wurde
    } catch (error) {
      console.error(`Fehler beim Löschen der Route ${routeName}:`, error);
    }
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

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="control-panel">
      <div className="left-container">
        <div className="control-buttons">
          <button className="define-route-button" onClick={handleDefineRoute}>
            Define Route
          </button>
          <div className="custom-dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown} disabled={isDriving}>
              {route || "Select Route"} ▼
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {routes.map((routeName) => (
                  <div key={routeName} className="dropdown-item">
                    <span
                      className={`route-name ${route === routeName ? "selected" : ""}`}
                      onClick={() => handleRouteChange(routeName)}
                    >
                      {routeName}
                    </span>
                    <button
                      className="delete-route-button"
                      onClick={() => handleDeleteRoute(routeName)}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="start-stop-button" onClick={handleDriveStop}>
            {isDriving ? "Stop" : "Drive"}
          </button>
        </div>

        {/* Pfeiltasten für die Richtung */}
        <div className="direction-button-up">
          <button
            className={`start-stop-button up ${direction === "forward" ? "active" : ""}`}
            onClick={() => setDirection("forward")}
          >
            ↑
          </button>
        </div>
        <div className="direction-buttons">
          <button
            className={`start-stop-button left ${direction === "left" ? "active" : ""}`}
            onClick={() => setDirection("left")}
          >
            ←
          </button>
          <button
            className={`start-stop-button down ${direction === "backward" ? "active" : ""}`}
            onClick={() => setDirection("backward")}
          >
            ↓
          </button>
          <button
            className={`start-stop-button right ${direction === "right" ? "active" : ""}`}
            onClick={() => setDirection("right")}
          >
            →
          </button>
        </div>
      </div>

      <div className="robot-placeholder">
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
        speed={50} // Beispielgeschwindigkeit
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />
      {showDefineRoute && <DefineRouteInterface onClose={() => setShowDefineRoute(false)} />}
    </div>
  );
};

export default ControlPanel;