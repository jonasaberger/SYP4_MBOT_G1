import React, { useRef } from 'react';
import styles from './css/SaveDefinedRoutePopup.module.css';

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
      onSave(routeName);
    }
  };

  const handleNo = () => {
    onClose();
  };

  return (
    <div className={styles['popup-overlay']}> {/* Use styles.className */}
      <div className={styles['popup-content']}>
        <p>Do you want to save this route?</p>
        <label>
          Route name: <input type="text" name="routeInput" ref={routeInputRef} />
        </label>
        <p ref={errorText} style={{ color: "red" }}></p>
        <div className={styles['popup-buttons']}>
          <button onClick={handleYes}>Save</button>
          <button onClick={handleNo}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SaveDefinedRoutePopup;