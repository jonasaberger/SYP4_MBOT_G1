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
        # Patch MongoClient vor der Initialisierung von DB_Bridge
        self.mongo_patcher = patch('pymongo.MongoClient')
        self.mock_mongo_client = self.mongo_patcher.start()
        self.mock_client_instance = MagicMock()
        self.mock_mongo_client.return_value = self.mock_client_instance

        self.frontend_bridge = FrontendBridge()
        self.service_manager = ServiceManager()
        self.db_bridge = DB_Bridge() 
        self.mbot_bridge = self.frontend_bridge.mbot_bridge
        self.app = self.service_manager.app
        self.client = self.app.test_client()
        self.mbot_bridge.configure_connection('172.169.10.1', '10.10.2.1')

        # Beispiel-Route für Tests
        self.test_route_data = [
            {"direction": "forward", "speed": "50", "duration": 3.794, "color": "255,255,255"},
            {"direction": "stop", "speed": "50", "duration": 1.181, "color": "255,255,255"},
            {"direction": "left", "speed": "50", "duration": 0.376, "color": "255,255,255"},
            {"direction": "stop", "speed": "50", "duration": 1.281, "color": "255,255,255"},
            {"direction": "backward", "speed": "50", "duration": 0.112, "color": "255,255,255"},
            {"direction": "stop", "speed": "50", "duration": 0.979, "color": "255,255,255"},
            {"direction": "right", "speed": "50", "duration": 0.157, "color": "255,255,255"},
            {"direction": "stop", "speed": "50", "duration": 1.08, "color": "255,255,255"}
        ]

    @patch('time.sleep', return_value=None)
    def test_receive_commands_automatic_mode_route(self, _):
        self.frontend_bridge.connected_users = {"192.168.1.100": "192.168.1.10"}
        self.frontend_bridge.current_mode = "automatic"
        with patch.object(self.frontend_bridge.db_bridge, 'get_route', return_value=[
            {"direction": "forward", "speed": "50", "duration": 0.01, "color": "red"},
            {"direction": "stop", "speed": "0", "duration": 0.01, "color": "red"}
        ]), \
        patch.object(self.frontend_bridge.mbot_bridge, 'send_message') as mock_send:
            with self.app.test_request_context(
                '/commands', method='POST',
                json={"route": "test_route"},
                environ_base={'REMOTE_ADDR': '192.168.1.10'}
            ):
                response = self.frontend_bridge.receive_commands()
                self.assertTrue(mock_send.called)

    @patch('time.sleep', return_value=None)
    def test_receive_commands_manual_drive(self, _):
        self.frontend_bridge.connected_users = {"192.168.1.100": "192.168.1.10"}
        self.frontend_bridge.current_mode = "controller"
        with patch.object(self.frontend_bridge.mbot_bridge, 'send_message') as mock_send:
            with self.app.test_request_context(
                '/commands', method='POST',
                json={"drive": "forward"},
                environ_base={'REMOTE_ADDR': '192.168.1.10'}
            ):
                response = self.frontend_bridge.receive_commands()
                mock_send.assert_called_with("forward")

    def test_receive_commands_ip_target_configure_connection(self):
        with patch.object(self.frontend_bridge.mbot_bridge, 'configure_connection') as mock_configure:
            with self.app.test_request_context(
                '/commands', method='POST',
                json={"ip-target": "192.168.1.100"},
                environ_base={'REMOTE_ADDR': '192.168.1.10'}
            ):
                response = self.frontend_bridge.receive_commands()
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json["status"], "success")
                mock_configure.assert_called_once_with("192.168.1.100", "192.168.1.10")
    

    @patch('db_bridge.DB_Bridge.push_data_DB')
    def test_define_route(self, mock_push):
        # Simuliere POST Request zum Definieren einer Route
        test_data = {
            "route_name": "test_route",
            "route_data": self.test_route_data
        }
        response = self.client.post('/define_route', json=test_data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["status"], "success")
        mock_push.assert_called_once_with("test_route", self.test_route_data)

    @patch('pymongo.MongoClient')
    def test_check_connection_success(self, mock_mongo_client):
        mock_client = MagicMock()
        mock_client.admin.command.return_value = True
        mock_mongo_client.return_value = mock_client

        with patch('builtins.print') as mock_print:
            self.db_bridge.check_connection()
            mock_print.assert_called_with("Verbindung erfolgreich!")

    @patch('pymongo.MongoClient')
    def test_mongodb_ping_success(self, mock_mongo_client):
        mock_client = MagicMock()
        mock_client.admin.command.return_value = {'ok': 1.0}
        mock_mongo_client.return_value = mock_client

        result = mock_client.admin.command('ping')
        mock_client.admin.command.assert_called_once_with('ping')
        self.assertEqual(result, {'ok': 1.0})
        print("MongoDB Ping erfolgreich!")

    @patch('pymongo.MongoClient')
    def test_mongodb_ping_failure(self, mock_mongo_client):
        mock_client = MagicMock()
        mock_client.admin.command.side_effect = ConnectionFailure("Could not connect")
        mock_mongo_client.return_value = mock_client

        with self.assertRaises(ConnectionFailure):
            mock_client.admin.command('ping')
        print("MongoDB Ping fehlgeschlagen (wie erwartet bei diesem Test)")

    def tearDown(self):
        self.mongo_patcher.stop()
        if hasattr(self.db_bridge, 'client'):
            self.db_bridge.client.close()

if __name__ == '__main__':
    unittest.main()
