const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Beispiel-Daten für die Richtung
const directions = {
  forward: "Der Roboter bewegt sich vorwärts.",
  backward: "Der Roboter bewegt sich rückwärts.",
  left: "Der Roboter dreht sich nach links.",
  right: "Der Roboter dreht sich nach rechts.",
};

// Endpoint für getCurrentDirection
app.post("/get_direction", (req, res) => {
  const { direction, duration } = req.body;

  // Validierung der Eingabedaten
  if (!direction || !duration) {
    return res.status(400).json({ error: "direction und duration sind erforderlich." });
  }

  if (!directions[direction]) {
    return res.status(400).json({ error: "Ungültige Richtung angegeben." });
  }

  // Beispiel-Antwort
  const response = {
    message: directions[direction],
    duration: `${duration} Sekunden`,
  };

  console.log(`Richtung: ${direction}, Dauer: ${duration}`);
  res.status(200).json(response);
});

// Server starten
const PORT = 8080;app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});