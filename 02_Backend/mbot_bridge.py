from flask import Flask, request, jsonify
from flask_cors import CORS
import socket
import os
from dotenv import load_dotenv

class MBotBridge:
    def __init__(self):
        load_dotenv()
        self.target_ip = None
        self.target_port = int(os.getenv('TARGET_PORT'))
        self.app = Flask(__name__)
        CORS(self.app)
        self.configure_routes()

    def configure_connection(self, target_ip='10.10.3.255'):
        print('Configuring connection with target IP: ', target_ip)
        self.target_ip = target_ip

    def send_message(self, message):
        if self.target_ip is None:
            print('Target IP is not configured.')
            return

        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.sendto(message.encode(), (self.target_ip, self.target_port))
        print(f'Sent message: {message}')

    def configure_routes(self):
        self.app.add_url_rule('/send_command', 'send_command', self.send_command_route, methods=['POST'])
        self.app.add_url_rule('/get_status', 'get_status', self.get_status_route, methods=['GET'])

    def send_command_route(self):
        data = request.json
        mode = data.get("mode")
        drive = data.get("drive")
        ip = data.get("ip")
        color = data.get("color")
        speed = data.get("speed")

        if not all([mode, drive, ip, color, speed]):
            return jsonify({"error": "Missing parameters"}), 400

        command = f"Mode: {mode}, Drive: {drive}, IP: {ip}, Color: {color}, Speed: {speed}"
        print(f'Received command: {command}')

        self.send_message(command)
        return jsonify({"message": f'Command "{command}" sent!'})

    def get_status_route(self):
        status = {
            'robot': 'online',
            'battery': '80%',
            'mode': 'discover',
            'driveTime': '0:00:00',
            'distance': '14m',
        }
        return jsonify(status)

    def start_server(self):
        self.app.run(host='0.0.0.0', port=8080)
