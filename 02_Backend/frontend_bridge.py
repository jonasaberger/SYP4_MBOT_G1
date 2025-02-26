import mbot_bridge as mbb
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import json
import os

class FrontendBridge:
    def __init__(self):
        self.mbot_bridge = mbb.MBotBridge()
        self.app = Flask(__name__)
        # Allow all traffic
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()
        self.recording = False
        self.command_log = []

        # Ensure Logs directory exists
        if not os.path.exists('Logs'):
            os.makedirs('Logs')

    def receive_commands(self):
        data = request.json
        mode = data.get("mode")
        drive = data.get("drive")
        ip_target = data.get("ip-target")
        ip_source = request.remote_addr
        color = data.get("color")
        speed = data.get("speed")

        if ip_target:
            self.mbot_bridge.configure_connection(ip_target, ip_source)
        elif mode:
            self.mbot_bridge.send_message(mode)
            print(mode)
        elif drive:
            self.mbot_bridge.send_message(drive)
            print(drive)

            # Start the tracking process
            if drive == "start":
                self.recording = True
                self.command_log = []
                self.start_time = time.time()
                print("Recording started")

            # Record the drive command if recording is active
            if self.recording and drive in ["forward", "backward", "left", "right", "stop"]:
                duration = time.time() - self.start_time

                if speed is None:
                    speed = 50
                    
                self.command_log.append({
                    "direction": drive,
                    "speed": speed,
                    "duration": duration
                })
                self.start_time = time.time()  # Reset start time for the next command
                print("Command recorded")

        elif color:
            self.mbot_bridge.send_message("color:" + color)
        elif speed:
            self.mbot_bridge.send_message("speed:" + speed)

        # Stop recording when the user enters the mode exit
        if drive == "exit" or mode == "exit":
            self.recording = False
            log_file_path = os.path.join('Logs', 'command_log.json')
            with open(log_file_path, "w") as f:
                json.dump(self.command_log, f, indent=4)
            print("Recording stopped and saved to command_log.json")
            print("Command Log:")
            print(json.dumps(self.command_log, indent=4))  # Print the command log to the console

        return jsonify({"status": "success", "message": "Command received"})  # Return a valid response

    def get_status_route(self):
        status = {
            'battery': '80%',
            'distance': '14m',
        }
        return jsonify(status)

    def start_server(self):
        self.app.run(host='0.0.0.0', port=8080)

    def configure_routes(self):
        self.app.add_url_rule('/receive_commands', 'receive_commands', self.receive_commands, methods=['POST'])
        self.app.add_url_rule('/get_status', 'get_status', self.get_status_route, methods=['GET'])

if __name__ == "__main__":
    bridge = FrontendBridge()
    bridge.app.run(host='0.0.0.0', port=5000)