import mbot_bridge as mbb
from flask import Flask, request, jsonify
from flask_cors import CORS


class FrontendBridge:
    def __init__(self):
        self.mbot_bridge = mbb.MBotBridge()
        self.app = Flask(__name__)
        # Allow all traffic
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()


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
            pass
        elif color:
            self.mbot_bridge.send_message("color:"+color)
        elif speed:
            self.mbot_bridge.send_message("speed:"+speed)

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