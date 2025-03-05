//Integration tests for the API service

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sessionsFilePath = path.join(__dirname, '../../sessions.json');

app.get('/api/sessions', (req, res) => {
  fs.readFile(sessionsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Fehler beim Laden der Sessions' });
    }
    const sessions = JSON.parse(data);
    res.json({ sessions });
  });
});

app.post('/api/save-sessions', (req, res) => {
  const { sessions } = req.body;
  if (!sessions) {
    return res.status(400).json({ message: "Keine Sessions-Daten erhalten" });
  }

  fs.writeFile(sessionsFilePath, JSON.stringify(sessions, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ message: 'Fehler beim Speichern der Sessions' });
    }
    res.status(200).json({ message: 'Sessions erfolgreich gespeichert' });
  });
});

describe('API Integration Tests', () => {
  it('should load sessions successfully', async () => {
    const response = await request(app).get('/api/sessions');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sessions');
    expect(Array.isArray(response.body.sessions)).toBe(true);
  });

  it('should save sessions successfully', async () => {
    const newSessions = [
      { ip: '192.168.0.1', name: 'Test Session 1' },
      { ip: '192.168.0.2', name: 'Test Session 2' },
    ];

    const response = await request(app)
      .post('/api/save-sessions')
      .send({ sessions: newSessions });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Sessions erfolgreich gespeichert');

    const savedSessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf8'));
    expect(savedSessions).toEqual(newSessions);
  });

  it('should return an error when saving sessions with invalid data', async () => {
    const response = await request(app)
      .post('/api/save-sessions')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Keine Sessions-Daten erhalten');
  });
});