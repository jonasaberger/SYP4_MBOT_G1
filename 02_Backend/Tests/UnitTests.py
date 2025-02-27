import unittest
import json
import sys
import os

# Verzeichnis 02_Backend zum Python-Pfad hinzufügen
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from frontend_bridge import FrontendBridge
from mbot_bridge import MBotBridge

class TestFrontendBridge(unittest.TestCase):
    def setUp(self):
        self.frontend_bridge = FrontendBridge()
        self.mbot_bridge = self.frontend_bridge.mbot_bridge
        self.app = self.frontend_bridge.app
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
        response = self.client.post('/receive_commands', json={"color": "red"})
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'Command received')
        print()

    def test_receive_commands_speed(self):
        response = self.client.post('/receive_commands', json={"speed": "fast"})
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

if __name__ == '__main__':
    unittest.main()