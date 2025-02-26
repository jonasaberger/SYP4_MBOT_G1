import axios from 'axios';

const apiBaseURL = 'http://10.10.0.103:8080';

let currentMode = null;
let lastDriveCommand = "stop";
let ipTargetSet = false;
let modeSet = false;

/**
 * Sendet einen einzelnen Befehl an die API.
 * @param {string} key - Der Name des Befehlsparameters (z. B. 'drive', 'mode', 'speed', 'color', 'ip-target')
 * @param {string|number} value - Der Wert des Befehlsparameters
 */
export const sendCommand = async (key, value) => {
  try {
    if (key === "ip-target") {
      await axios.post(`${apiBaseURL}/receive_commands`, { [key]: value });
      ipTargetSet = true;
      console.log(`IP-Adresse gesetzt: ${value}`);
      return;
    }

    if (!ipTargetSet) {
      throw new Error("IP-Adresse muss zuerst gesetzt werden.");
    }

    if (key === "mode") {
      if (currentMode) {
        await axios.post(`${apiBaseURL}/receive_commands`, { mode: "exit" });
        console.log("Modus verlassen");
      }
      currentMode = value;
      modeSet = true;
      console.log(`Modus gesetzt: ${value}`);
      return;
    }

    if (!modeSet) {
      throw new Error("Modus muss zuerst gesetzt werden.");
    }

    if (key === "drive") {
      lastDriveCommand = value;
    }

    if (key === "color") {
      await axios.post(`${apiBaseURL}/receive_commands`, { color: value });
      console.log(`LED-Farbe gesetzt: ${value}`);
      return;
    }

    if (key === "speed") {
      await axios.post(`${apiBaseURL}/receive_commands`, { speed: value });
      console.log(`Geschwindigkeit gesetzt: ${value}`);
      return;
    }

    await axios.post(`${apiBaseURL}/receive_commands`, { [key]: value });
    console.log(`Befehl gesendet: ${key} =`, value);
  } catch (error) {
    console.error(`Fehler beim Senden des Befehls (${key}):`, error);
    throw new Error(`Fehler beim Senden des Befehls (${key})`);
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
    // Drive-Befehl senden (drive oder stop)
    await sendCommand("drive", driveCommand);
    console.log(`Drive-Befehl gesendet: ${driveCommand}`);
    lastDriveCommand = driveCommand;

    // Falls der Drive-Befehl "Stop" ist, sicherstellen, dass der Stopp korrekt durchgeführt wird
    if (driveCommand === "stop") {
      await sendStopIfNoDrive();
    }
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
    await axios.post(`${apiBaseURL}/receive_commands`, { drive: "stop" });
    console.log("Automatisch Stop gesendet");
    lastDriveCommand = "stop";
  } catch (error) {
    console.error("Fehler beim Senden des Stop-Befehls:", error);
  }
};

/**
 * Holt die aktuellen Sensordaten vom MBOT.
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
