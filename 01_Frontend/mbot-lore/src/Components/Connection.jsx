import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate importieren
import { sendIPCommand } from '../API_Service/service';
import Papa from 'papaparse';
import './Connection_UI.css';

const isValidIPv4 = (ip) => {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

const ConnectionComponent = () => {
  const [ip, setIp] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ipError, setIpError] = useState('');
  const navigate = useNavigate(); // useNavigate initialisieren

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions'); // API-Anfrage zum Laden der CSV-Daten
      const csvData = await response.text();
      const parsedData = Papa.parse(csvData, { header: true }).data;
      setSessions(parsedData.slice(0, 3)); // Nur die letzten 3 Sessions anzeigen
    } catch (err) {
      console.error('Fehler beim Laden der Sessions:', err);
    }
  };

  // Neue Session in der CSV-Datei speichern
  const saveSession = async (newSession) => {
    try {
      const updatedSessions = [newSession, ...sessions].slice(0, 3);
      setSessions(updatedSessions);

      // Senden der aktualisierten Sessions an das Backend
      const csv = Papa.unparse(updatedSessions);
      await fetch('/api/save-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csv }),
      });
    } catch (err) {
      console.error('Fehler beim Speichern der Session:', err);
    }
  };

  // Verbindungsversuch
  const handleConnect = async () => {
    if (!isValidIPv4(ip)) {
      setIpError('Ungültige IP-Adresse!');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');
    setIpError('');

    try {
      await sendIPCommand(ip);
      setSuccess('Verbindung erfolgreich!');

      const newSession = { ip, name };
      saveSession(newSession);

      // Weiterleitung nach erfolgreicher Verbindung
      navigate('/control'); // Weiterleitung zur gewünschten Seite (z.B. '/nextpage')
    } catch (err) {
      setError('Verbindung fehlgeschlagen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Wiederherstellen einer Session
  const handleRestoreSession = (session) => {
    setIp(session.ip);
    setName(session.name);
    handleConnect();
  };

  const handleIpChange = (e) => {
    const newIp = e.target.value;
    setIp(newIp);
    setIpError(isValidIPv4(newIp) ? '' : 'Ungültige IP-Adresse!');
  };

  return (
    <div className="container">
      <div className="connection-box">
        <h1 className="title">MBOT Verbindung</h1>
        <div className="form">
          <label>IP:</label>
          <input type="text" value={ip} onChange={handleIpChange} />
          {ipError && <p className="error">{ipError}</p>}
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <button className='connect-btn' onClick={handleConnect} disabled={loading || ipError}>
            {loading ? 'Connecting...' : 'Connect'}
          </button>
          
          {/* Restore Session */}
          <button className='restore-btn' onClick={() => setShowDropdown(!showDropdown)}>Restore Session</button>
          {showDropdown && (
            <div className="dropdown">
              {sessions.map((session, index) => (
                <div key={index} onClick={() => handleRestoreSession(session)}>
                  <span className="session-name">{session.name}</span>
                  <span className="session-ip">({session.ip})</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default ConnectionComponent;
