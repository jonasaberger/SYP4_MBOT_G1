import React, { useState, useEffect } from 'react';

const InfoPanel = ({ distance, runtime, value, onToggleCollapse, isCollapsed }) => {
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [speedInMetersPerMinute, setSpeedInMetersPerMinute] = useState(0);

  useEffect(() => {
    // Berechnung der Geschwindigkeit in Metern pro Minute
    const speed = value * 0.174; // 1 Speed = 17,4 cm/min
    setSpeedInMetersPerMinute(speed);

    // Berechnung der zurückgelegten Distanz
    const distanceCovered = (runtime / 60) * speed; // runtime in Sekunden
    setCalculatedDistance(distanceCovered.toFixed(2));
  }, [runtime, value]);

  return (
    <div className={`info-panel ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={onToggleCollapse}>
        {isCollapsed ? "▶" : "◁"}
      </button>
      {!isCollapsed && (
        <>
          <p><strong>Distance:</strong> {calculatedDistance} m</p>
          <p><strong>Runtime:</strong> {runtime} s</p>
          <p><strong>Speed:</strong> {speedInMetersPerMinute.toFixed(2)} m/min</p>
        </>
      )}
    </div>
  );
};

export default InfoPanel;

// 1 Speed = lt. Messung: 17,4 cm/min