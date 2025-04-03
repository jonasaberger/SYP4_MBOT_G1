import os
import json
import mbot_bridge as mbb
import frontend_bridge as feb
import db_bridge as dbb
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from swagger_config import swaggerui_blueprint, SWAGGER_URL, swagger_config

class ServiceManager:
    def __init__(self):
        self.app = Flask(__name__)
        self.frontend_bridge = feb.FrontendBridge()

        # Allow all traffic
        CORS(self.app, resources={r"/*": {"origins": "*"}})

        # Generate swagger.json dynamically
        self.generate_swagger_json()

        # Register Swagger UI blueprint
        self.app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

        # Serve the swagger.json file
        self.configure_routes()

    def generate_swagger_json(self):
        
        # Generate swagger.json dynamically
        static_dir = os.path.join(os.path.dirname(__file__), 'static')
        os.makedirs(static_dir, exist_ok=True)  # Create the static directory if it doesn't exist
        swagger_file_path = os.path.join(static_dir, 'swagger.json')
        with open(swagger_file_path, 'w') as swagger_file:
            json.dump(swagger_config, swagger_file, indent=4)

    def start_server(self):
        self.app.run(host='0.0.0.0', port=8080)

    def configure_routes(self):
        # Main endpoints
        self.app.add_url_rule('/receive_commands', 'receive_commands', self.frontend_bridge.receive_commands, methods=['POST'])
        self.app.add_url_rule('/get_status', 'get_status', self.frontend_bridge.get_status_route, methods=['GET'])

        # Route-related endpoints
        self.app.add_url_rule('/save_log', 'save_log', self.frontend_bridge.db_bridge.save_log, methods=['POST'])
        self.app.add_url_rule('/get_all_routes', 'get_all_routes', self.frontend_bridge.db_bridge.get_collection_names, methods=['GET'])
        self.app.add_url_rule('/define_route', 'define_route', self.frontend_bridge.define_route, methods=['POST'])
        self.app.add_url_rule('/end_route', 'end_route', self.frontend_bridge.end_route, methods=['POST'])
        self.app.add_url_rule('/delete_route', 'delete_route', self.frontend_bridge.db_bridge.delete_route, methods=['POST'])


if __name__ == "__main__":
    service_manager = ServiceManager()
    service_manager.start_server()

