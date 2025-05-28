import frontend_bridge as feb
import db_bridge as dbb
from flask import Flask
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint 

SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "SYP4_MBOT_G1",
        'favicon32': '/static/favicon-32x32.png',
        'favicon16': '/static/favicon-16x16.png'
    }
)

class ServiceManager:
    def __init__(self, server_port=8080, host_ip='0.0.0.0'):
        self.server_port = server_port
        self.host_ip = host_ip 

        self.app = Flask(__name__, static_folder='static')
        self.frontend_bridge = feb.FrontendBridge()

        # Allow all traffic
        CORS(self.app, resources={r"/*": {"origins": "*"}})

        # Register Swagger UI blueprint
        self.app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

        self.configure_routes()

    def start_server(self):
        self.app.run(host=self.host_ip, port=self.server_port)

    def configure_routes(self):
        # Main endpoints
        self.app.add_url_rule('/receive_commands', 'receive_commands', self.frontend_bridge.receive_commands, methods=['POST'])
        self.app.add_url_rule('/logout', 'logout', self.frontend_bridge.logout, methods=['POST'])

        # Route-related endpoints
        self.app.add_url_rule('/save_log', 'save_log', self.frontend_bridge.db_bridge.save_log, methods=['POST'])
        self.app.add_url_rule('/get_all_routes', 'get_all_routes', self.frontend_bridge.db_bridge.get_collection_names, methods=['GET'])
        self.app.add_url_rule('/define_route', 'define_route', self.frontend_bridge.define_route, methods=['POST'])
        self.app.add_url_rule('/end_route', 'end_route', self.frontend_bridge.end_route, methods=['POST'])
        self.app.add_url_rule('/delete_route', 'delete_route', self.frontend_bridge.db_bridge.delete_route, methods=['POST'])
        self.app.add_url_rule('/get_discovery_points', 'get_discover_points', self.frontend_bridge.get_discover_points, methods=['GET'])
        self.app.add_url_rule('/get_route_data', 'get_route_data', self.frontend_bridge.db_bridge.get_route_data, methods=['GET'])


if __name__ == "__main__":
    service_manager = ServiceManager()
    service_manager.start_server()