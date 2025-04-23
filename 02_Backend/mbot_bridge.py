import socket
import os
from dotenv import load_dotenv

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
            print(f'Sent message: {message}')
        finally:
            s.close()

    def configure_connection(self, target_ip, source_ip):
        print('Configuring connection with target IP: ', target_ip)
        self.target_ip = target_ip
        self.send_message('connect:'+source_ip)

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
                return data.decode()

        except Exception as e:
            print(f"An error occurred: {e}")

        finally:
            sock.close()