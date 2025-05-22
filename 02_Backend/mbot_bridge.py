import socket
import os
from dotenv import load_dotenv
import time

class MBotBridge:
    def __init__(self):
        load_dotenv()
        self.target_ip = None
        self.source_ip = None
        self.target_port = int(os.getenv('TARGET_PORT'))


    def disconnect(self):
        if self.target_ip is None:
            print('Target IP is not configured.')
            return

        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.sendto('disconnect'.encode(), (self.target_ip, self.target_port))
        finally:
            s.close()
            print("Disconnected from target IP: ", self.target_ip)
            self.target_ip = None


    def send_message(self, message): 
        if self.target_ip is None:
            print('Target IP is not configured.')
            return

        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            s.sendto(message.encode(), (self.target_ip, self.target_port))
        finally:
            s.close()

    def configure_connection(self, target_ip, source_ip):
        print('Configuring connection with target IP: ', target_ip)
        self.target_ip = target_ip
        self.send_message('connect:'+source_ip)

    def receive_message(self):
        UDP_IP = "0.0.0.0"
        UDP_PORT = int(os.getenv('SOURCE_PORT'))
        BUFFER_SIZE = 1024

        # Create socket with reuse options
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            sock.bind((UDP_IP, UDP_PORT))
            print(f"Listening on port: {UDP_PORT}")

            # Set timeout
            sock.settimeout(2)  # 5 second timeout

            while True:
                try:
                    data, addr = sock.recvfrom(BUFFER_SIZE)
                    message = data.decode().strip()
                    print(f"Received message from {addr}: {message}")

                    # Stop listening if "stop" command is received
                    if message.lower() == "stop":
                        print("Stop command received. Stopping message reception.")
                        break

                    return message  # Return the received message

                except socket.timeout:
                    print("Timeout occurred, no data received")
                    continue
                except Exception as e:
                    print(f"An error occurred: {e}")
                    break

        finally:
            sock.close()
            print("Socket closed.")