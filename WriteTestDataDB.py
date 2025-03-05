from pymongo import MongoClient
import os
import json
import time
import socket

# Verbindung zu MongoDB Atlas
uri = "mongodb+srv://mbot:Hons14@mbot.vcbcf.mongodb.net/?retryWrites=true&w=majority&appName=MBOT"
client = MongoClient(uri)

# Datenbank wählen (wird automatisch erstellt, falls nicht vorhanden)
db = client["mbot_data"]

# Neue Collection erstellen (wird automatisch erstellt, sobald wir Daten einfügen)
collection = db["testRoute"]


try:
    route = list(collection.find({}, {"_id": 0}))
    print("Route erfolgreich gelesen")
except Exception as e:
    print(f"Lesen fehlgeschlagen: {e}")

commands = route

for command in commands:
    direction = command.get('direction')
    speed = command.get('speed')
    duration = command.get('duration')
    color = command.get('color')
    print(direction, speed, duration, color + "\n")