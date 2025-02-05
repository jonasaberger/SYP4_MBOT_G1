import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Main_control from '../Components/Main_Control';

const apiBaseURL = 'http://localhost:8080';

const MBOTControl = () => {
  const [message, setMessage] = useState('');
  const [sensorData, setSensorData] = useState(null);
  const [commandParams, setCommandParams] = useState({
    mode: Main_control.getMode(),
    drive: '',
    ip: '',
    color: '',
    speed: ''
  });

  useEffect(() => {
    axios.get(`${apiBaseURL}/status`)
      .then(response => setMessage(response.data.message))
      .catch(error => setMessage('Fehler beim Laden der API'));
  }, []);

  const sendCommand = (commandParams) => {
    axios.post(`${apiBaseURL}/send_command`, commandParams)
      .then(response => {
        console.log('Antwort vom MBOT:', response.data);
        setMessage(response.data.status || 'Befehl gesendet!');
      })
      .catch(error => {
        console.error('Fehler beim Senden des Befehls:', error);
        setMessage('Fehler beim Senden des Befehls');
      });
  };

  const sendFetchCommand = (commandParams) => {
    fetch(`${apiBaseURL}/send_command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commandParams),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Antwort vom MBOT (Fetch):', data);
      setMessage(data.status || 'Befehl gesendet!');
    })
    .catch(error => {
      console.error('Fehler:', error);
      setMessage('Fehler beim Senden des Befehls');
    });
  };

  const fetchSensorData = () => {
    axios.get(`${apiBaseURL}/get_status`)
      .then(response => {
        console.log('Sensor Daten:', response.status);
        setSensorData(response.status);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Sensordaten:', error);
        setMessage('Fehler beim Abrufen der Sensordaten');
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCommandParams(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const sendAllCommands = () => {
    sendCommand(commandParams);
  };

  const sendSingleCommand = (field) => {
    const singleCommand = { [field]: commandParams[field] };
    sendCommand(singleCommand);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">MBOT Steuerung</h1>
      <p className="mt-4 p-4 bg-white shadow-md rounded-lg">{message}</p>
      
      <div className="mt-4">
        <label>Mode:</label>
        <input type="text" name="mode" value={commandParams.mode} onChange={handleInputChange} />
        <label>Drive:</label>
        <input type="text" name="drive" value={commandParams.drive} onChange={handleInputChange} />
        <label>IP:</label>
        <input type="text" name="ip" value={commandParams.ip} onChange={handleInputChange} />
        <label>Color:</label>
        <input type="text" name="color" value={commandParams.color} onChange={handleInputChange} />
        <label>Speed:</label>
        <input type="text" name="speed" value={commandParams.speed} onChange={handleInputChange} />
      </div>

      <button onClick={sendAllCommands}>Send All Commands</button>
      <button onClick={() => sendSingleCommand('drive')}>Send Drive Command</button>
      <button onClick={fetchSensorData}>Fetch Sensor Data</button>

      {sensorData && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800">Sensor Data</h2>
          <pre>{JSON.stringify(sensorData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MBOTControl;