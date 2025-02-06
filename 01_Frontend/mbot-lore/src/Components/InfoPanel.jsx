const InfoPanel = ({ distance, runtime, onToggleCollapse, isCollapsed }) => {
  return (
    <div className={`info-panel ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={onToggleCollapse}>
        {isCollapsed ? "▶" : "◁"}
      </button>
      {!isCollapsed && (
        <>
          <p><strong>Distance:</strong> {distance} m</p>
          <p><strong>Runtime:</strong> {runtime} s</p>
        </>
      )}
    </div>
  );
};
export default InfoPanel;