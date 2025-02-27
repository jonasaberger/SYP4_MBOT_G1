import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendCommand } from '../API_Service/service';
import './css/Connection.css';

const ConnectionComponent = () => {
  const [ip, setIp] = useState('');
  const [name, setName] = useState('');
  const [sourceIp, setSourceIp] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ipError, setIpError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSourceIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setSourceIp(data.ip);
      } catch (error) {
        console.error('Fehler beim Ermitteln der eigenen IP-Adresse:', error);
      }
    };
    fetchSourceIp();
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/sessions');

        if (!response.ok) throw new Error("Fehler beim Laden der Sessions");

        const result = await response.json();
        console.log('Geladene Sessions:', result.sessions);

        if (Array.isArray(result.sessions)) {
          setSessions(result.sessions);
        } else if (result.sessions && Array.isArray(result.sessions.sessions)) {
          setSessions(result.sessions.sessions);
        } else {
          console.error('Fehler: Unerwartetes JSON-Format', result);
          setSessions([]);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Sessions:', err);
        setSessions([]);
      }
    };
    loadSessions();
  }, []);

  const isValidIPv4 = (ip) => {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  };

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
      const response = await sendCommand("ip-target", ip);
  
      if (!response || response.status !== "success") {
        throw new Error("Server hat die Verbindung nicht bestätigt!");
      }
  
      setSuccess('Verbindung erfolgreich!');
      navigate('/control');
  
      const newSession = { ip, name };
      const updatedSessions = [newSession, ...sessions].slice(0, 3);
      setSessions(updatedSessions);
  
      const saveResponse = await fetch('http://localhost:3001/api/save-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: updatedSessions }),
      });
  
      if (!saveResponse.ok) {
        throw new Error("Fehler beim Speichern der Session");
      }
    } catch (err) {
      setError('Verbindung fehlgeschlagen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  


  const handleRestoreSession = (session) => {
    console.log("Ausgewählte Session:", session);
    setIp(session.ip);
    setName(session.name);
    handleConnect();
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
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className='connect-btn' onClick={handleConnect} disabled={loading}>
            Connect
          </button>
          <button className='restore-btn' onClick={() => setShowDropdown(!showDropdown)}>
            Restore Session
          </button>
          {showDropdown && (
            <div className="dropdown">
              {sessions.length > 0 ? (
                <div className="session-buttons">
                  {sessions.map((session, index) => (
                    <button key={index} className="session-btn" onClick={() => handleRestoreSession(session)}>
                      {session.name || "Unbekannt"} ({session.ip})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-sessions">Keine gespeicherten Sessions vorhanden.</p>
              )}
            </div>
          )}
        </div>
        {success && <p className="success">{success}</p>}
        {error && <p className="error">{error}</p>}
        {ipError && <p className="error">{ipError}</p>}
      </div>
    </div>
  );
};

export default ConnectionComponent;
