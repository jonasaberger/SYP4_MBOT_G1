import axios from 'axios';

const apiBaseURL = 'http://10.10.0.103:8080';  // IP-Adresse

let currentMode = null;
let lastDriveCommand = "stop";
let ipTargetSet = false;
let modeSet = false;

/**
 * Sendet einen einzelnen Befehl an die API, verhindert doppelte Mode- und Stop-Befehle.
 * @param {string} key - Der Name des Befehlsparameters (z. B. 'drive', 'mode', 'speed', 'color', 'ip-target')
 * @param {string|number} value - Der Wert des Befehlsparameters
 */
export const sendCommand = async (key, value) => {
  if (key === "mode" && currentMode === value) {
    console.log(`Modus ${value} wurde bereits gesetzt, übersprungen.`);
    return;
  }
  
  if (key === "drive" && value === "stop" && lastDriveCommand === "stop") {
    console.log("Stop-Befehl wurde bereits gesendet, übersprungen.");
    return;
  }

  try {
    const response = await axios.post(`${apiBaseURL}/receive_commands`, { [key]: value });
 
    if (!response || response.status !== 200) {
      throw new Error(`Server-Fehler: ${response.status} ${response.statusText}`);
    }

    console.log(`Befehl gesendet: ${key} = ${value}, Server-Antwort:`, response.data);

    if (key === "ip-target") {
      ipTargetSet = true;
      console.log(`IP-Adresse erfolgreich gesetzt: ${value}`);
    } else if (key === "mode") {
      currentMode = value;
      modeSet = true;
      console.log(`Modus erfolgreich gesetzt: ${value}`);
    } else if (key === "drive") {
      lastDriveCommand = value;
    }

    return response.data;
  } catch (error) {
    console.error(`Fehler beim Senden des Befehls (${key}):`, error.response?.data || error.message);
    throw new Error(`Fehler beim Senden des Befehls (${key}): ${error.message}`);
  }
};

/**
 * Startet die Drive-Sequence, stellt sicher, dass die Reihenfolge beachtet wird.
 */
export const startDriveSequence = async (driveCommand) => {
  if (!ipTargetSet) {
    throw new Error("IP-Adresse muss zuerst gesetzt werden.");
  }

  if (!modeSet) {
    throw new Error("Modus muss zuerst gesetzt werden.");
  }

  try {
    await sendCommand("drive", driveCommand);
    console.log(`Drive-Befehl gesendet: ${driveCommand}`);
    lastDriveCommand = driveCommand;
  } catch (error) {
    console.error("Fehler beim Starten der Drive-Sequence:", error);
  }
};

/**
 * Sendet ein Stop-Signal, falls keine Fahrtrichtung gewählt wurde.
 */
export const sendStopIfNoDrive = async () => {
  if (lastDriveCommand === "stop") return;
  try {
    await sendCommand("drive", "stop");
    console.log("Automatisch Stop gesendet");
    lastDriveCommand = "stop";
  } catch (error) {
    console.error("Fehler beim Senden des Stop-Befehls:", error);
  }
};

/**
 * Holt die aktuellen Sensordaten vom MBOT.
 */
export const fetchBattery = async () => {
  try {
    const response = await axios.get(`${apiBaseURL}/get_status`);
    console.log('Sensor Daten:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Sensordaten:', error);
    throw new Error('Fehler beim Abrufen der Sensordaten');
  }
};

export const sendSaveRoute = async (routeName) => {
  const key = "collection_name";
  try{
    await axios.post(`${apiBaseURL}/save_log`, { [key]: routeName });
  } catch(error){
    console.error('Fehler beim Speichern der Route:', error);
    throw new Error('Fehler beim Speichern der Route');
  }
}