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
        self.collection_names = []

        self.mbot_bridge = mbb.MBotBridge()
        self.db_bridge = dbb.DB_Bridge()

        # Ensure Logs directory exists
        if not os.path.exists('Logs'):
            os.makedirs('Logs')

    # Receive commands from the frontend
    def receive_commands(self):
        data = request.json
        mode = data.get("mode")
        drive = data.get("drive")
        ip_target = data.get("ip-target")
        ip_source = request.remote_addr
        color = data.get("color")
        speed = data.get("speed")


        # IP - Configuration
        if ip_target:
            self.mbot_bridge.configure_connection(ip_target, ip_source)
            print(f"Configured connection with target IP: {ip_target} and source IP: {ip_source}")

        # Send the mode to the mBot
        elif mode:
            self.mbot_bridge.send_message(mode)
            self.current_mode = mode
            print(f"Mode sent to mBot: {mode}")

        elif drive and self.current_mode == "controller":
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
            print("HOOOOOOOONNSSSS YARAKKK")

            # Update the collection names from the database
            self.collection_names = self.db_bridge.get_collection_names()

            pass

        # Change the color or speed of the mBot
        elif color:
            self.current_color = color
            self.mbot_bridge.send_message("color:" + color)
            print(f"Color changed to: {color}")
        elif speed:
            self.current_speed = speed
            self.mbot_bridge.send_message("speed:" + speed)
            print(f"Speed changed to: {speed}")

        # Stop recording when the user enters the mode exit
        if drive == "exit":
            self.recording = False

            log_file_path = os.path.join('Logs', 'command_log.json')
            with open(log_file_path, "w") as f:
                json.dump(self.command_log, f, indent=4)

            print("Recording stopped and saved to command_log.json")
            print("Command Log:")
            with open(log_file_path, "r") as f:
                print(f.read())  # Print the command log to the console

        return jsonify({"status": "success", "message": "Command received"})  # Return a valid response


    # Return all the prev saved routes to the frontend
    def get_all_routes(self):
        return jsonify(self.collection_names)

    # TODO: Send the battery status once when connecting to the frontend
    def get_status_route(self):
        status = {
            'battery': '80%',
        }
        return jsonify(status)
