import socket
import time
import os
from dotenv import load_dotenv

class MBotBridge:
    def __init__(self):
        load_dotenv()
        self.target_ip = None
        self.target_port = int(os.getenv('TARGET_PORT'))

    def configure_connection(self, target_ip = '10.10.3.255'):
        print('Configuring connection with target IP: ', target_ip)
        self.target_ip = target_ip

    def send_message(self, message):
        if self.target_ip is None:
            print('Target IP is not configured.')
            return

        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.sendto(message.encode(), (self.target_ip, self.target_port))
        print(f'Sent message: {message}')

    def receive_message(self):
        UDP_IP = "0.0.0.0"
        UDP_PORT = int(os.getenv('SOURCE_PORT'))
        BUFFER_SIZE = 1024  # Define a buffer size for receiving data

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind((UDP_IP, UDP_PORT))
            print(f"Listening on port: {UDP_PORT}")

            while True:
                data, addr = sock.recvfrom(BUFFER_SIZE)
                print(f"Received message from {addr}: {data.decode()}")

        except Exception as e:
            print(f"An error occurred: {e}")

        finally:
            sock.close()
