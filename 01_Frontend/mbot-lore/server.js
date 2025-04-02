const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',  // Erlaubt Anfragen vom React-Frontend
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}));
app.use(bodyParser.json());

const sessionsFilePath = path.join(__dirname, 'sessions.json');

app.get('/api/sessions', (req, res) => {
  console.log("GET /api/sessions aufgerufen");

  fs.readFile(sessionsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Fehler beim Laden der Sessions:", err);
      return res.status(500).json({ message: 'Fehler beim Laden der Sessions' });
    }
    const sessions = JSON.parse(data);
    res.json({ sessions });
  });
});

app.post('/api/save-sessions', (req, res) => {
  console.log("POST /api/save-sessions aufgerufen");

  const { sessions } = req.body;
  if (!sessions) {
    return res.status(400).json({ message: "Keine Sessions-Daten erhalten" });
  }

  fs.writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2), 'utf8', (err) => {
    if (err) {
      console.error("Fehler beim Speichern:", err);
      return res.status(500).json({ message: 'Fehler beim Speichern der Sessions' });
    }
    res.status(200).json({ message: 'Sessions erfolgreich gespeichert' });
  });
});

app.listen(3001, () => {
  console.log('✅ Server läuft auf http://localhost:3001');
});