import mbot_bridge as mbb
import frontend_bridge as feb
import db_bridge as dbb
from flask import Flask, request, jsonify
from flask_cors import CORS

class ServiceManager:
    def __init__(self):
        self.frontend_bridge = feb.FrontendBridge()
        self.db_bridge = dbb.DB_Bridge()
        
        self.app = Flask(__name__)

        # Allow all traffic
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()

    def start_server(self):
        self.app.run(host='0.0.0.0', port=8080)

    def configure_routes(self):
        self.app.add_url_rule('/receive_commands', 'receive_commands', self.frontend_bridge.receive_commands, methods=['POST'])
        self.app.add_url_rule('/get_status', 'get_status', self.frontend_bridge.get_status_route, methods=['GET'])
        self.app.add_url_rule('/save_log', 'save_log', self.db_bridge.save_log, methods=['POST'])
        self.app.add_url_rule('/load_log', 'load_log', self.db_bridge.load_log, methods=['POST'])

if __name__ == "__main__":
    bridge = ServiceManager()
    bridge.app.run(host='0.0.0.0', port=8080)
        