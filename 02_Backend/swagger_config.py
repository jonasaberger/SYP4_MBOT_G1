from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Service Manager API"
    }
)

swagger_config = {
    "swagger": "2.0",
    "info": {
        "title": "Service Manager API",
        "description": "API documentation for the Service Manager endpoints.",
        "version": "1.0.0"
    },
    "host": "10.10.0.103:8080",
    "basePath": "/",
    "schemes": ["http"],
    "paths": {
        "/receive_commands": {
            "post": {
                "summary": "Receive commands",
                "description": "Endpoint to receive commands from the frontend.",
                "responses": {
                    "200": {
                        "description": "Commands received successfully."
                    }
                }
            }
        },
        "/end_route": {
            "post": {
                "summary": "End route",
                "description": "Endpoint to end a route.",
                "responses": {
                    "200": {
                        "description": "Route ended successfully."
                    }
                }
            }
        },
        "/get_status": {
            "get": {
                "summary": "Get status",
                "description": "Endpoint to get the current status.",
                "responses": {
                    "200": {
                        "description": "Status retrieved successfully."
                    }
                }
            }
        },
        "/save_log": {
            "post": {
                "summary": "Save log",
                "description": "Endpoint to save a log entry.",
                "responses": {
                    "200": {
                        "description": "Log saved successfully."
                    }
                }
            }
        },
        "/define_route": {
            "post": {
                "summary": "Define route",
                "description": "Endpoint to define a new route.",
                "responses": {
                    "200": {
                        "description": "Route defined successfully."
                    }
                }
            }
        },
        "/get_all_routes": {
            "get": {
                "summary": "Get all routes",
                "description": "Endpoint to retrieve all defined routes.",
                "responses": {
                    "200": {
                        "description": "Routes retrieved successfully."
                    }
                }
            }
        }
    }
}