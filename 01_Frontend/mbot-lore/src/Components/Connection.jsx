import { useState } from "react";
import { fetchDataFromAPI } from "../API_Service/service"; 
import "./css/Connection.css"; 


export default function ConnectionForm() {
  const [ip, setIp] = useState("");
  const [mbotName, setMbotName] = useState("");
  const [error, setError] = useState(null); // Fehlerstatus
  const [loading, setLoading] = useState(false); // Ladezustand
  const [success, setSuccess] = useState(null); // Erfolgsmeldung

  // Funktion für den Verbindungsaufbau
  const handleConnect = async () => {
    setLoading(true); // Ladezustand aktivieren
    setError(null); // Fehler zurücksetzen
    setSuccess(null); // Erfolg zurücksetzen
    
    try {
      // API-Aufruf, um die Verbindung zu starten
      const response = await fetchDataFromAPI('/connect', 'POST', { ip, mbotName });
      setSuccess('Connection successful!'); // Erfolgsmeldung setzen
      console.log(response); // Ausgabe der Antwort der API
    } catch (err) {
      setError('Connection failed: ' + err.message); // Fehler setzen
    } finally {
      setLoading(false); // Ladezustand deaktivieren
    }
  };

  // Funktion zum Wiederherstellen der Sitzung
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
            onChange={(e) => setIp(e.target.value)}  // IP wird gesetzt
          />

          <label>Mbot Name:</label>
          <input
            type="text"
            value={mbotName}
            onChange={(e) => setMbotName(e.target.value)}  // Mbot Name wird gesetzt
          />

          <button className="connect-btn" onClick={handleConnect} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
          </button>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <button className="restore-btn" onClick={handleRestoreSession}>
            Restore Session
          </button>
        </div>
      </div>
    </div>
  );
}
