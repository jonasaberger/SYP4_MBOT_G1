// src/services/apiService.js

export const fetchDataFromAPI = async (endpoint, method = 'GET', body = null) => {
    const url = `https://deine-api-url.com${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer DEIN_TOKEN', // Hier API-Token hinzufügen, wenn nötig
    };

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);  // Für POST-Methoden wird der Body mitgegeben
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Daten');
        }
        return await response.json();  // Antwort als JSON zurückgeben
    } catch (err) {
        throw new Error(err.message);  // Fehler weitergeben
    }
};
