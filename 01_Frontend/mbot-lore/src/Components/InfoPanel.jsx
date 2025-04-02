<<<<<<< HEAD
const InfoPanel = ({ distance, runtime, battery, value, onToggleCollapse, isCollapsed }) => {
=======
const InfoPanel = ({ distance, runtime, value, onToggleCollapse, isCollapsed }) => {
>>>>>>> 9e44aa91ecadf29717d15b0dfa087a8dcccb11c4
  return (
    <div className={`info-panel ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={onToggleCollapse}>
        {isCollapsed ? "▶" : "◁"}
      </button>
      {!isCollapsed && (
        <>
          <p><strong>Distance:</strong> {distance} m</p>
          <p><strong>Runtime:</strong> {runtime} s</p>
          <p><strong>Speed:</strong> {value * 0.174} m/min</p>
<<<<<<< HEAD
          <p><strong>Battery:</strong> {battery}</p>
=======
>>>>>>> 9e44aa91ecadf29717d15b0dfa087a8dcccb11c4
        </>
      )}
    </div>
  );
};
<<<<<<< HEAD

export default InfoPanel;
=======
export default InfoPanel;

// 1 Speed = lt. Messung: 17,4cm/min
>>>>>>> 9e44aa91ecadf29717d15b0dfa087a8dcccb11c4
