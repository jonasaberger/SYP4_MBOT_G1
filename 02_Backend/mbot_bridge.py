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

    
