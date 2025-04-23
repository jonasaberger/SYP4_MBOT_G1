import React, { useRef } from 'react';
import './css/SaveDefinedRoutePopup.css';

const SaveDefinedRoutePopup = ({ onClose, onSave }) => {
  const routeInputRef = useRef(null);
  const errorText = useRef(null);

  const handleYes = () => {
    const routeName = routeInputRef.current.value.trim();
    if (routeName === "") {
      errorText.current.innerText = "Route name is empty.";
      console.log("Route name is empty.");
    } else {
      console.log("Route name:", routeName);
      onSave(routeName); // Call the onSave function with the route name
    }
  };

  const handleNo = () => {
    onClose(); // Close the popup without saving
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>Do you want to save this route?</p>
        <label>
          Route name: <input type="text" name="routeInput" ref={routeInputRef} />
        </label>
        <p ref={errorText} style={{ color: "red" }}></p>
        <div className="popup-buttons">
          <button onClick={handleYes}>Save</button>
          <button onClick={handleNo}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SaveDefinedRoutePopup;