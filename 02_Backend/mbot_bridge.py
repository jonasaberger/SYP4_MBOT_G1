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
            sock.settimeout(5.0)  # 5 second timeout

            data, addr = sock.recvfrom(BUFFER_SIZE)
            print(f"Received message from {addr}: {data.decode()}")
            return data.decode()

        except socket.timeout:
            print("Timeout occurred, no data received")
            return None
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
        finally:
            sock.close()
            # Small delay to ensure proper socket closure
            time.sleep(0.1)