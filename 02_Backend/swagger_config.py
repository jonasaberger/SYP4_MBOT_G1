from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "SYP4_MBOT_G1",
        'favicon32': '/static/favicon.ico',
        'favicon16': '/static/favicon.ico'  
    }
)

swagger_config = {
    "swagger": "2.0",
    "info": {
        "title": "Service Manager API",
        "description": "API documentation for the Service Manager endpoints. Commands must be sent one after another in the correct sequence.",
        "version": "1.0.0"
    },
    "host": "10.10.0.103:8080",
    "basePath": "/",
    "schemes": [
        "http"
    ],
    "paths": {
        "/receive_commands": {
            "post": {
                "summary": "Receive commands",
                "description": "Endpoint to send commands to the mBot. Commands must be sent sequentially. For example, set `mode` first, then `drive`, and so on. Do not use `/end_route` unless the mBot is in automatic mode.",
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "required": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "ip-target": {
                                    "type": "string",
                                    "example": "192.168.1.1",
                                    "description": "IP address of the target mBot."
                                },
                                "mode": {
                                    "type": "string",
                                    "enum": ["controller", "automatic", "discovery", "exit"],
                                    "example": "controller",
                                    "description": "Mode of the mBot. Must be set before sending other commands."
                                },
                                "drive": {
                                    "type": "string",
                                    "enum": ["forward", "backward", "left", "right", "stop", "exit"],
                                    "example": "forward",
                                    "description": "Drive command for the mBot. Requires `mode` to be set to `controller`."
                                },
                                "route": {
                                    "type": "string",
                                    "example": "route1",
                                    "description": "Route name for automatic mode. Requires `mode` to be set to `automatic`."
                                },
                                "color": {
                                    "type": "string",
                                    "example": "255,255,255",
                                    "description": "Color of the mBot in RGB format."
                                },
                                "speed": {
                                    "type": "integer",
                                    "example": 50,
                                    "description": "Speed of the mBot (1-100)."
                                }
                            },
                            "required": ["mode"]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Command received successfully."
                    },
                    "400": {
                        "description": "Invalid input data or incorrect command sequence."
                    }
                }
            }
        },
        "/logout": {
            "post": {
                "summary": "Logout and disconnect mBot",
                "description": "Disconnects the mBot from the current session and resets its state to 'Connect To Host'.",
                "responses": {
                    "200": {
                        "description": "mBot disconnected successfully."
                    }
                }
            }
        },
        "/end_route": {
            "post": {
                "summary": "End route",
                "description": "Endpoint to stop the current route in automatic mode. Only use this endpoint when the mBot is running in automatic mode. Using this in other modes may cause unexpected behavior.",
                "responses": {
                    "200": {
                        "description": "Route stopped successfully."
                    },
                    "400": {
                        "description": "No active route to stop."
                    }
                }
            }
        },
        "/get_status": {
            "get": {
                "summary": "Get status",
                "description": "Endpoint to retrieve the current status of the mBot.",
                "responses": {
                    "200": {
                        "description": "Status retrieved successfully.",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "battery": {
                                    "type": "string",
                                    "example": "80%",
                                    "description": "Battery level of the mBot."
                                }
                            }
                        }
                    }
                }
            }
        },
        "/save_log": {
            "post": {
                "summary": "Save log",
                "description": "Endpoint to save the command log to the database.",
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "required": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "collection_name": {
                                    "type": "string",
                                    "example": "log_collection",
                                    "description": "Name of the database collection to save the log."
                                }
                            },
                            "required": ["collection_name"]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Log saved successfully."
                    },
                    "404": {
                        "description": "Log file not found."
                    }
                }
            }
        },
        "/define_route": {
            "post": {
                "summary": "Define route",
                "description": "Endpoint to define a new route for automatic mode.",
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "required": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "route_name": {
                                    "type": "string",
                                    "example": "route1",
                                    "description": "Name of the route."
                                },
                                "route_data": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "direction": {
                                                "type": "string",
                                                "example": "forward",
                                                "description": "Direction of movement."
                                            },
                                            "speed": {
                                                "type": "integer",
                                                "example": 50,
                                                "description": "Speed of movement (1-100)."
                                            },
                                            "duration": {
                                                "type": "number",
                                                "example": 2.5,
                                                "description": "Duration of movement in seconds."
                                            },
                                            "color": {
                                                "type": "string",
                                                "example": "255,255,255",
                                                "description": "Color of the mBot during this step."
                                            }
                                        }
                                    }
                                }
                            },
                            "required": ["route_name", "route_data"]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Route defined successfully."
                    },
                    "400": {
                        "description": "Invalid input data."
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
                        "description": "Routes retrieved successfully.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                }
            }
        },
        "/delete_route": {
            "post": {
                "summary": "Delete route",
                "description": "Endpoint to delete a specific route.",
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "required": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "route_name": {
                                    "type": "string",
                                    "example": "route1",
                                    "description": "Name of the route to delete."
                                }
                            },
                            "required": ["route_name"]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Route deleted successfully."
                    },
                    "404": {
                        "description": "Route not found."
                    }
                }
            }
        },
        "/get_discovery_points": {
            "get": {
                "summary": "Get discovery points",
                "description": "Retrieve all discovery points collected during discovery mode.",
                "responses": {
                    "200": {
                        "description": "Discovery points retrieved successfully.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "x": {
                                        "type": "number",
                                        "example": 1.23,
                                        "description": "X-coordinate of the discovery point."
                                    },
                                    "y": {
                                        "type": "number",
                                        "example": 4.56,
                                        "description": "Y-coordinate of the discovery point."
                                    },
                                    "z": {
                                        "type": "number",
                                        "example": 7.89,
                                        "description": "Z-coordinate of the discovery point."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/get_route_data": {
            "get": {
                "summary": "Get route data",
                "description": "Retrieve data for a specific route from the database.",
                "parameters": [
                    {
                        "name": "collection_name",
                        "in": "query",
                        "required": True,
                        "type": "string",
                        "description": "Name of the route collection to retrieve."
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Route data retrieved successfully.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "direction": {
                                        "type": "string",
                                        "example": "forward",
                                        "description": "Direction of movement."
                                    },
                                    "speed": {
                                        "type": "integer",
                                        "example": 50,
                                        "description": "Speed of movement (1-100)."
                                    },
                                    "duration": {
                                        "type": "number",
                                        "example": 2.5,
                                        "description": "Duration of movement in seconds."
                                    },
                                    "color": {
                                        "type": "string",
                                        "example": "255,255,255",
                                        "description": "Color of the mBot during this step."
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid input or missing collection name."
                    },
                    "500": {
                        "description": "Error retrieving route data."
                    }
                }
            }
        }
    }
}