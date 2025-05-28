import React from "react";

const InfoPanel = ({ distance, runtime, speed, onToggleCollapse, isCollapsed }) => {
  const formatDetails = () => {
    if (typeof distance === "number" && typeof runtime === "number") {
      return `Distance: ${distance.toFixed(2)} cm, Runtime: ${runtime} s`;
    }
    return "Details not available";
  };

  return (
    <div className={`info-panel ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={onToggleCollapse}>
        {isCollapsed ? "▶" : "◁"}
      </button>
      {!isCollapsed && (
        <>
          <p><strong>Speed:</strong> {speed} cm/min</p>
          <p><strong>{formatDetails()}</strong></p>
        </>
      )}
    </div>
  );
};

export default InfoPanel;