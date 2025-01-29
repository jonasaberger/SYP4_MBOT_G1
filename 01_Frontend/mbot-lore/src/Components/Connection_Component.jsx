import { useState } from "react";
import "./Connection_UI.css"; // CSS-Datei importieren

export default function ConnectionForm() {
  const [ip, setIp] = useState("");
  const [mbotName, setMbotName] = useState("");

  const handleConnect = () => {
    console.log("Connecting to:", ip, mbotName);
  };

  const handleRestoreSession = () => {
    console.log("Restoring session...");
  };

  return (
    <div className="container">
      <div className="connection-box">
        <h1 className="title">Connection</h1>
        <div className="form">
          <label>IP:</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />

          <label>Mbot Name:</label>
          <input
            type="text"
            value={mbotName}
            onChange={(e) => setMbotName(e.target.value)}
          />

          <button className="connect-btn" onClick={handleConnect}>
            Connect
          </button>

          <button className="restore-btn" onClick={handleRestoreSession}>
            Restore Session
          </button>
        </div>
      </div>
    </div>
  );
}
