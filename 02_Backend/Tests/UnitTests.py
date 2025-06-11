import unittest
import json
import sys
import os
from unittest.mock import patch, MagicMock
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError


# Verzeichnis 02_Backend zum Python-Pfad hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from frontend_bridge import FrontendBridge
from service_manager import ServiceManager
from db_bridge import DB_Bridge

class Testing(unittest.TestCase):
    def setUp(self):
        self.frontend_bridge = FrontendBridge()
        self.service_manager = ServiceManager()
        self.db_bridge = DB_Bridge()
        self.mbot_bridge = self.frontend_bridge.mbot_bridge
        self.app = self.service_manager.app
        self.client = self.app.test_client()
        self.mbot_bridge.configure_connection('172.169.10.1', '10.10.2.1')

    # Falls Fehler: Target IP is not configured. tritt auf wegen Code in der frontend_bridge
    # Positiv Tests

    def test_receive_commands_mode(self):
        response = self.client.post('/receive_commands', json={"mode": "controller"})
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'Command received')
        print()

    def test_receive_commands_drive(self):
        response = self.client.post('/receive_commands', json={"drive": "forward"})
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'Command received')
        print()

    def test_receive_commands_color(self):
        response = self.client.post('/receive_commands', json={"color": "255,255,255"})
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'Command received')
        print()

    def test_receive_commands_speed(self):
        response = self.client.post('/receive_commands', json={"speed": "50"})
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'Command received')

    # Negativ Tests
    """
    def test_receive_commands_no_data(self):
        response = self.client.post('/receive_commands', json={})
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], 'No command received')

    def test_receive_commands_partial_data(self):
        response = self.client.post('/receive_commands', json={"mode": "controller"})
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], 'Incomplete command received') 
    """

    # DB Tests

    @patch('pymongo.MongoClient')
    def test_check_connection_success(self, mock_mongo_client):
        mock_client = MagicMock()
        mock_client.admin.command.return_value = True
        mock_mongo_client.return_value = mock_client

        with patch('builtins.print') as mock_print:
            self.db_bridge.check_connection()
            mock_print.assert_called_with("Verbindung erfolgreich!")
        
    """
    @patch('pymongo.MongoClient')
    def test_check_connection_failure(self, mock_mongo_client):
        mock_client = MagicMock()
        mock_client.admin.command.side_effect = ConnectionFailure("Connection failed")
        mock_mongo_client.return_value = mock_client

        with patch('builtins.print') as mock_print:
            self.db_bridge.check_connection()
            mock_print.assert_called_with("Verbindung fehlgeschlagen: Connection failed")
    """

    """
    @patch('pymongo.MongoClient')
    @patch('builtins.open', new_callable=MagicMock)
    def test_push_log_DB_success(self, mock_open, mock_mongo_client):
        # Mock the file read operation
        mock_file = MagicMock()
        mock_file.__enter__.return_value.read.return_value = '[{"command": "test"}]'
        mock_open.return_value = mock_file

        # Mock the MongoDB client and database
        mock_client = MagicMock(spec=MongoClient)
        mock_db = MagicMock()
        mock_collection = MagicMock()

        # Set up the mock client to return the mock db
        mock_client.__getitem__.return_value = mock_db
        mock_db.list_collection_names.return_value = []  # Simulate no existing collections
        mock_db.__getitem__.return_value = mock_collection  # Simulate creating a new collection

        # Replace the MongoClient in DB_Bridge with the mock client
        mock_mongo_client.return_value = mock_client

        # Call the method and check if it prints the success message
        with patch('builtins.print') as mock_print:
            self.db_bridge.push_log_DB("test_collection")
            mock_print.assert_called_with("Daten erfolgreich gespeichert!")

        # Verify that the collection was created and data was inserted
        mock_db.drop_collection.assert_not_called()  # Collection did not exist, so drop should not be called
        mock_collection.insert_many.assert_called_with([{"command": "test"}])
    """

if __name__ == '__main__':
    unittest.main()