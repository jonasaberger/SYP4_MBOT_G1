from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json
from flask import request, jsonify

class DB_Bridge:
    def __init__(self):
        load_dotenv()
        self.client = MongoClient(os.getenv('MONGO_URI'))
        self.db = self.client['mbot_data']

    # Check the connection to the database
    def check_connection(self):
        try:
            self.client.admin.command('ping')
            print("Verbindung erfolgreich!")
        except Exception as e:
            print(f"Verbindung fehlgeschlagen: {e}")

    # Save the command log to the MongoDB database
    def push_log_DB(self, collection_name):
        try:
            # Drop the existing collection if it exists
            if collection_name in self.db.list_collection_names():
                self.db.drop_collection(collection_name)
            
            # Create a new collection
            collection = self.db[collection_name]
            
            # Read the command log from the file
            with open('Logs/command_log.json', "r") as f:
                command_log = json.load(f)
            
            # Insert the command log into the new collection
            collection.insert_many(command_log)
            print("Daten erfolgreich gespeichert!")
        except Exception as e:
            print(f"Speichern fehlgeschlagen: {e}")

    # Save the locally stored command log to the database
    def save_log(self):
        data = request.json
        collection_name = data.get("collection_name")
        log_file_path = os.path.join('Logs', 'command_log.json')

        if collection_name == "":
            if os.path.exists(log_file_path):
                os.remove(log_file_path)
                print("Log deleted")
                return jsonify({"status": "success", "message": "Log deleted"})
            else:
                print("Log file not found")
                return jsonify({"status": "error", "message": "Log file not found"})

        self.push_log_DB(collection_name)
        print("Log saved")
        return jsonify({"status": "success", "message": f"Log saved to database collection '{collection_name}'"})
    
    def get_collection_names(self):
        return self.db.list_collection_names()


    def get_route(self, collection_name):
        try:
            collection = self.db[collection_name]
            route = list(collection.find())
            return route
        except Exception as e:
            print(f"Route not found: {e}")
            return None

