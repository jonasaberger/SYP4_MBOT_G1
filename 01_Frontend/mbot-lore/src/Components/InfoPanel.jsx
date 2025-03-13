const InfoPanel = ({ distance, runtime, value, onToggleCollapse, isCollapsed }) => {
  return (
    <div className={`info-panel ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={onToggleCollapse}>
        {isCollapsed ? "▶" : "◁"}
      </button>
      {!isCollapsed && (
        <>
          <p><strong>Distance:</strong> {distance} m</p>
          <p><strong>Runtime:</strong> {runtime} s</p>
          <p><strong>Speed:</strong> {value*0.174} m/min</p>
        </>
      )}
    </div>
  );
};
export default InfoPanel;


// 1 Speed = lt. Messung: 17,4cm/min