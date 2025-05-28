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
    console.log(`Sende Befehl: ${key} = ${value}...`);
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


export const sendEndRouteCommand = async () => {
  try {
    const response = await axios.post(`${apiBaseURL}/end_route`);
    console.log("EndRoute-Befehl erfolgreich gesendet:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Senden des EndRoute-Befehls:", error.response?.data || error.message);
    throw new Error("Fehler beim Senden des EndRoute-Befehls");
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

export const getCurrentDirection = async (direction, duration) => {
  try {
    const payload = { direction, duration };
    const response = await axios.post(`${apiBaseURL}/get_direction`, payload);
    console.log('Aktuelle Richtung:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen der aktuellen Richtung:', error.response?.data || error.message);
    throw new Error('Fehler beim Abrufen der aktuellen Richtung');
  }
};

export const getCurrentRoute = async () => {
  try {
    const response = await axios.get(`${apiBaseURL}/get_current_route`);
    console.log('Aktuelle Route:', response.data);

    // Speichere die gesamte Liste der Route
    const routeList = response.data;


    return routeList;
  } catch (error) {
    console.error('Fehler beim Abrufen der aktuellen Route:', error.response?.data || error.message);
    throw new Error('Fehler beim Abrufen der aktuellen Route');
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
};

export const getRoutes = async () => {
  try{
    const response = await axios.get(`${apiBaseURL}/get_all_routes`);
    console.log('Routes:', response.data);
    return response.data;
  } catch(error){
    console.error('Fehler beim Abrufen der Routen:', error);
    throw new Error('Fehler beim Abrufen der Routen');
  }
}

export const sendDefinedRoute = async (name, route) => {
  console.log("Route:", route);
  console.log("Name:", name);
  const payload = {
    route_name: name,
    route_data: route,
  };
  try {
    const response = await axios.post(`${apiBaseURL}/define_route`, payload);
    console.log('Route erfolgreich gespeichert:', response.data);
  } catch (error) {
    console.error('Fehler beim Speichern der Route:', error);
    throw new Error('Fehler beim Speichern der Route');
  }
}

export const deleteRoute = async (routeName) => {
  try {
    const response = await axios.post(`${apiBaseURL}/delete_route`, { collection_name: routeName });
    console.log(`Route ${routeName} erfolgreich gelöscht:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Löschen der Route ${routeName}:`, error);
    throw new Error(`Fehler beim Löschen der Route ${routeName}`);
  }
};

export const getRoute = async (routeName) => {
  try {
    console.log("RouteName:", routeName);
    const response = await axios.get(`${apiBaseURL}/get_route_data`, {
      params: { collection_name: routeName }, // Pass routeName as a query parameter
      headers: {
        "Content-Type": "application/json", // Ensure the correct Content-Type
      },
    });
    console.log(`Route ${routeName} erfolgreich abgerufen:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Route ${routeName}:`, error);
    throw new Error(`Fehler beim Abrufen der Route ${routeName}`);
  }
}

export const logout = async () => {
  try {
    const response = await axios.post(`${apiBaseURL}/logout`);
    console.log('Logout erfolgreich:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Logout:', error);
    throw new Error('Fehler beim Logout');
  }
}