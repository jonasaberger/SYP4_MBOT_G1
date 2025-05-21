import mbot_bridge as mbb
import db_bridge as dbb
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import json
import os

class FrontendBridge:
    def __init__(self):
        self.recording = False
        self.command_log = []
        self.current_speed = 50  # Default speed
        self.current_color = "255,255,255"  # Default color
        self.current_mode = None
        self.anti_hons = True

        self.stoproute = False
        self.discovery_points = []

        self.mbot_bridge = mbb.MBotBridge()
        self.db_bridge = dbb.DB_Bridge()

        # Ensure Logs directory exists
        if not os.path.exists('Logs'):
            os.makedirs('Logs')

        self.connected_users = {}  # Map of ip_target to ip_source


    # Get a custom-defined route from the frontend and save it to the database
    def define_route(self):
        data = request.json
        route_name = data.get("route_name")
        route_data = data.get("route_data")

        if not route_name or not route_data:
            return jsonify({"status": "error", "message": "Route name and data are required"}), 400

        # Save the route to the database
        self.db_bridge.push_data_DB(route_name, route_data)
        print(f"Route '{route_name}' saved to database")

        return jsonify({"status": "success", "message": f"Route '{route_name}' saved to database"})

    def end_route(self):
        self.stoproute = True
        self.mbot_bridge.send_message("stop")
        return jsonify({"status": "success", "message": "Route stopped"})


    # Main receive method for commands from the frontend
    def receive_commands(self):
        data = request.json
        ip_target = data.get("ip-target")
        mode = data.get("mode")
        drive = data.get("drive")
        route = data.get("route")
        ip_source = request.remote_addr
        color = data.get("color")
        speed = data.get("speed")

        # Block traffic from 10.10.0.174 if anti_hons is True
        if self.anti_hons and ip_source == "10.10.0.174":
            print(f"Traffic blocked from IP: {ip_source} due to anti_hons being enabled")
            return jsonify({"status": "error", "message": "HONS HS"}), 403

        # Ensure the Logs directory exists
        logs_dir = 'Logs'
        os.makedirs(logs_dir, exist_ok=True)

        # Path to the command log file
        log_file_path = os.path.join(logs_dir, 'command_log.json')

        # Create the command_log.json file if it doesn't exist
        if not os.path.exists(log_file_path):
            with open(log_file_path, "w") as f:
                json.dump([], f)  # Initialize with an empty list
            print(f"Created new command log file at {log_file_path}")

        # IP - Configuration
        if ip_target:
            # Associate the user's IP with the mBot's IP
            self.connected_users[ip_target] = ip_source
            self.mbot_bridge.configure_connection(ip_target, ip_source)
            print(f"Configured connection with target IP: {ip_target} and source IP: {ip_source}")
            return jsonify({"status": "success", "message": "Connection configured"})

        # Check if the user's IP is authorized to access any mBot
        authorized_ip_target = None
        for target, source in self.connected_users.items():
            if source == ip_source:
                authorized_ip_target = target
                break

        if not authorized_ip_target:
            return jsonify({"status": "error", "message": "Unauthorized access or no configured mBot"}), 403

        # Log the authorized target for debugging
        print(f"User {ip_source} is authorized to send commands to mBot with IP {authorized_ip_target}")

        # Send the mode to the mBot
        if mode:
            self.mbot_bridge.send_message(mode)
            self.current_mode = mode
            print(f"Mode sent to mBot: {mode}")

        if drive and self.current_mode == "controller":
            self.mbot_bridge.send_message(drive)
            print(f"Drive command sent to mBot: {drive}")

            # Start the tracking process
            if drive == "start":
                self.recording = True
                self.command_log = []
                self.start_time = time.time()
                print("Recording started")

            # Record the drive command if recording is active
            if self.recording and drive in ["forward", "backward", "left", "right", "stop"]:
                duration = time.time() - self.start_time
                self.command_log.append({
                    "direction": drive,
                    "speed": self.current_speed,
                    "duration": duration,
                    "color": self.current_color
                })
                self.start_time = time.time()  # Reset start time for the next command
                print(f"Command recorded: {self.command_log[-1]}")


        if self.current_mode == "automatic":
            if route:
                self.stoproute = False  # Reset stoproute at the start of automatic mode
                # Get the specific route from the database
                route_data = self.db_bridge.get_route(route)
                print(f"Route data: {route_data}")

                for command in route_data:
                    if self.stoproute:
                        print("Automatic mode stopped its route")
                        self.mbot_bridge.send_message("end")
                        self.stoproute = False
                        break

                    direction = command.get("direction")
                    speed = command.get("speed")
                    duration = command.get("duration")
                    color = command.get("color")

                    # Send the command to the mBot

                    # Change the color or speed of the mBot
                    self.mbot_bridge.send_message("color:" + color)
                    self.mbot_bridge.send_message("speed:" + speed)

                    # Send the drive command to the mBot
                    if direction in ["forward", "backward", "left", "right", "stop"]:
                        self.mbot_bridge.send_message(direction)

                    time.sleep(duration)


        if self.current_mode == "discovery" and drive == "start":
            print("Discovery mode activated")
            self.mbot_bridge.send_message("start")

            while drive != "stop":
                received_data = self.mbot_bridge.receive_message()

                # Process the received data directly as a tuple
                try:
                    if isinstance(received_data, str):
                        # Convert the received string to a tuple if necessary
                        point = eval(received_data) if "(" in received_data else received_data
                    else:
                        point = received_data

                    # Ensure the point is a tuple
                    if isinstance(point, tuple) and len(point) == 3:
                        self.discovery_points.append(point)
                        print(f"Discovery point: {point}")
                    else:
                        print(f"Invalid discovery point format: {point}")

                except Exception as e:
                    print(f"Error processing discovery point: {e}")

                if drive == "stop":
                    self.mbot_bridge.send_message("stop")
                    print("Discovery mode stopped")
                    break


        # Change the color or speed of the mBot
        elif color:
            self.current_color = color
            self.mbot_bridge.send_message("color:" + color)
            print(f"Color changed to: {color}")
        elif speed:
            self.current_speed = speed
            self.mbot_bridge.send_message("speed:" + speed)
            print(f"Speed changed to: {speed}")

        # Stop recording and save the route only if the current mode is controller and drive is exit
        if drive == "exit" and self.current_mode == "controller":
            self.recording = False

            log_file_path = os.path.join('Logs', 'command_log.json')
            with open(log_file_path, "w") as f:
                json.dump(self.command_log, f, indent=4)

            print("Recording stopped and saved to command_log.json")
            print("Command Log:")
            with open(log_file_path, "r") as f:
                print(f.read())  # Print the command log to the console

        if drive == "exit" and self.current_mode == "automatic":
            print("Exiting automatic mode")
            self.mbot_bridge.send_message("end")
        
        if drive == "exit" and self.current_mode == "discovery":
            print("Exiting discovery mode")
            self.mbot_bridge.send_message("exit")
        return jsonify({"status": "success", "message": "Command received"}) 


    def logout(self):
        print("Logout request received")

        # Disconnect the mBot
        self.mbot_bridge.disconnect()
        print("mBot disconnected")
        return jsonify({"status": "success", "message": "mBot disconnected"})

    def get_discover_points(self):
        return jsonify(self.discovery_points)
