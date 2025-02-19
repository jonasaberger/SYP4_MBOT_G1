import axios from 'axios';

const apiBaseURL = 'http://10.10.0.103:8080';


 /* Sendet nur die IP-Adresse mit "mode: discovery"
 */
export const sendIPCommand = async (ipTarget) => {
  try {
    const response = await axios.post(`${apiBaseURL}/receive_commands`, {
      'ip-target': ipTarget
    });
    console.log('Antwort vom MBOT:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Senden der IP:', error);
    throw new Error('Fehler beim Senden der IP-Adresse');
  }
};


 /* Sendet alle aktuellen Steuerbefehle zusammen
 */
export const sendAllCommands = async ({ drive, ipSource, ipTarget, color, speed }) => {
  validateInputs(drive, color, speed);
  
  try {
    const response = await axios.post(`${apiBaseURL}/receive_commands`, {
      mode: 'control',
      drive,
      'ip-source': ipSource,
      'ip-target': ipTarget,
      color,
      speed: speed.toString() // API erwartet String
    });
    console.log('Gesamter Befehl gesendet:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Senden des Befehls:', error);
    throw new Error('Fehler beim Senden des Befehls');
  }
};


 /* Sendet nur einen einzelnen Befehl (z. B. nur "drive" oder nur "speed")
 */
export const sendSingleCommand = async (field, value, ipSource, ipTarget) => {
  if (!ipTarget) throw new Error('IP-Adresse erforderlich!');

  const command = { mode: 'control', 'ip-source': ipSource, 'ip-target': ipTarget, [field]: value };

  try {
    const response = await axios.post(`${apiBaseURL}/send_commands`, command);
    console.log(`Einzelner Befehl gesendet: ${field} = ${value}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Senden von ${field}:`, error);
    throw new Error(`Fehler beim Senden von ${field}`);
  }
};

/*
  Validiert Fahrmodus, Farbe und Geschwindigkeit
 */
const validateInputs = (drive, color, speed) => {
  const validDrives = ['Forward', 'Backward', 'Right', 'Left', 'Stop', 'Exit'];
  if (!validDrives.includes(drive)) {
    throw new Error(`Ungültiger Fahrbefehl! Erlaubt: ${validDrives.join(', ')}`);
  }

  if (!/^(?:\d{1,3},\d{1,3},\d{1,3}|null)$/.test(color)) {
    throw new Error('Ungültiges Farbformat! Erwartet: "255,255,255" oder "null"');
  }

  if (isNaN(speed) || speed < 0 || speed > 100) {
    throw new Error('Ungültige Geschwindigkeit! Erwartet: Wert zwischen 0 und 100');
  }
};

/*
  Holt die aktuellen Sensordaten
 */
export const fetchSensorData = async () => {
  try {
    const response = await axios.get(`${apiBaseURL}/get_status`);
    console.log('Sensor Daten:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Sensordaten:', error);
    throw new Error('Fehler beim Abrufen der Sensordaten');
  }
};