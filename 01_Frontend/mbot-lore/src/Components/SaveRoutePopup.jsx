import React, { useRef } from 'react';
import styles from './css/SaveRoutePopup.module.css';
import { sendSaveRoute } from '../API_Service/service';

const SaveRoutePopup = ({ onClose }) => {
  const routeInputRef = useRef(null);
  const errorText = useRef(null);

  const handleYes = async () => {
    if (routeInputRef.current.value === "") {
      errorText.current.innerText = "Route name is empty.";
      console.log("Route name is empty.");
    } else {
      console.log("Route name:", routeInputRef.current.value);
      await sendSaveRoute(routeInputRef.current.value);
      onClose();
    }
  };

  const handleNo = async () => {
    await sendSaveRoute("");
    onClose();
  };

  return (
    <div className={styles['popup-overlay']}>
      <div className={styles['popup-content']}>
        <p>Do you want to save this route?</p>
        <label>
          Route name: <input type="text" name="routeInput" ref={routeInputRef} />
        </label>
        <p ref={errorText} style={{color:"red"}}></p>
        <button className={styles['popup-content-button']} onClick={handleYes}>Yes</button>
        <button className={styles['popup-content-button']} onClick={handleNo}>No</button>
      </div>
    </div>
  );
};

export default SaveRoutePopup;