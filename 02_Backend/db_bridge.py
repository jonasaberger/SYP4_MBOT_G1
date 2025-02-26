from pymongo import MongoClient
from dotenv import load_dotenv
import os

class DB_Bridge:
    def __init__(self):
        load_dotenv()
        self.client = MongoClient(os.getenv('MONGO_URI'))
        self.db = self.client['mbot_data']
        self.collection = self.db['drive_data']


    # Check the connection to the database
    def check_connection(self):
        try:
            self.client.admin.command('ping')
            print("Verbindung erfolgreich!")
        except Exception as e:
            print(f"Verbindung fehlgeschlagen: {e}")
            

    # Save the command log to the database
    def save_command_log(self, command_log):
        try:
            self.collection.insert_many(command_log)
            print("Daten erfolgreich gespeichert!")
        except Exception as e:
            print(f"Speichern fehlgeschlagen: {e}")