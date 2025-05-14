import cyberpi
import time
import usocket  # type: ignore
import os
import random

# Variables
movement_speed = 50
tracking_enabled = False

physical_mode = False
discover_mode = False
automatic_mode = False

current_socket = None
backend_ip = "10.10.0.103"  # Define backend IP here

def create_socket():
    """Create and return a new socket instance"""
    sock = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
    sock.setsockopt(usocket.SOL_SOCKET, usocket.SO_REUSEADDR, 1)
    local_ip = cyberpi.network.get_ip()
    sock.bind((local_ip, 6666))
    return sock

def network_module():
    cyberpi.network.config_sta("htljoh-public", "joh12345")
    
    while True:
        cyberpi.console.clear()
        cyberpi.console.print("Configuring Network")
        isConnected = cyberpi.network.is_connect()
        if not isConnected:    
            cyberpi.led.on(255, 0, 0)
            cyberpi.console.print(".")
            time.sleep(1)
            cyberpi.console.print(".")
            time.sleep(1)
            cyberpi.console.print(".")
            time.sleep(1)
        else:
            cyberpi.console.clear()
            cyberpi.led.on(0, 255, 0)
            cyberpi.console.println("Network Configured")
            cyberpi.console.println("--------------")
            cyberpi.console.println("")
            break
        
    sockaddr = cyberpi.network.get_ip()
    cyberpi.console.println("My IP Address: " + sockaddr)
    cyberpi.console.println("--------------")
    cyberpi.console.println("Waiting for Host")
 
    return create_socket()

def close_socket(sock):
    """Properly close a socket"""
    try:
        if sock:
            sock.close()
    except:
        pass

def physical_module(speed=50):
    global physical_mode, movement_speed, tracking_enabled, current_socket

    physical_mode = True
    cyberpi.console.println("Control Mode")
    
    # Create a new socket for this module
    current_socket = create_socket()
    current_socket.settimeout(0.1)  # Add timeout to prevent blocking

    try:
        while physical_mode:
            try:
                command, adr = current_socket.recvfrom(1024)
                txt = str(command, "utf-8").strip()

                if txt == "exit":
                    cyberpi.mbot2.EM_stop("all")
                    physical_mode = False
                    tracking_enabled = False
                    cyberpi.console.println("Exiting Control Mode..")
                    break
                elif txt == "start":
                    tracking_enabled = True
                    cyberpi.console.println("Tracking Enabled")
                    continue
                elif txt == "stop":
                    cyberpi.mbot2.EM_stop("all")
                    continue
                elif txt.startswith("color:"):
                    change_color(txt)
                elif txt.startswith("speed:"):
                    new_speed = int(txt.split(":")[1])
                    if 0 <= new_speed <= 100:
                        movement_speed = new_speed
                        cyberpi.console.println("Speed: " + str(new_speed) + "%")
                
                if tracking_enabled and txt in ["forward", "backward", "left", "right"]:
                    if txt == "forward":
                        cyberpi.mbot2.forward(movement_speed)
                    elif txt == "backward":
                        cyberpi.mbot2.backward(movement_speed)
                    elif txt == "left":
                        cyberpi.mbot2.turn_left(movement_speed)
                    elif txt == "right":
                        cyberpi.mbot2.turn_right(movement_speed)
            except usocket.timeout:
                continue
            time.sleep(0.1)
    finally:
        close_socket(current_socket)
        current_socket = None

def automatic_module(speed=50):
    global automatic_mode, movement_speed, current_socket

    automatic_mode = True
    cyberpi.console.println("Automatic Mode")
    
    current_socket = create_socket()
    current_socket.settimeout(0.1)

    try:
        while automatic_mode:
            try:
                command, adr = current_socket.recvfrom(1024)
                txt = str(command, "utf-8").strip()

                if txt == "exit":
                    cyberpi.mbot2.EM_stop("all")
                    automatic_mode = False
                    cyberpi.console.println("Exiting Automatic Mode..")
                    break
                elif txt == "end":
                    cyberpi.console.println("Ended Current-Route")
                    cyberpi.mbot2.EM_stop("all")
                    continue
                elif txt.startswith("color:"):
                    change_color(txt)
                elif txt.startswith("speed:"):
                    new_speed = int(txt.split(":")[1])
                    if 0 <= new_speed <= 100:
                        movement_speed = new_speed
                        cyberpi.console.println("Speed: " + str(new_speed) + "%")
                
                if txt in ["forward", "backward", "left", "right", "stop"]:
                    if txt == "forward":
                        cyberpi.mbot2.forward(movement_speed)
                    elif txt == "backward":
                        cyberpi.mbot2.backward(movement_speed)
                    elif txt == "left":
                        cyberpi.mbot2.turn_left(movement_speed)
                    elif txt == "right":
                        cyberpi.mbot2.turn_right(movement_speed)
                    elif txt == "stop":
                        cyberpi.mbot2.EM_stop("all")
            except usocket.timeout:
                continue
            time.sleep(0.1)
    finally:
        close_socket(current_socket)
        current_socket = None

def discover_module():
    global discover_mode, current_socket

    discover_mode = True
    cyberpi.console.println("Discovery Mode")
    
    current_socket = create_socket()
    current_socket.settimeout(0.1)

    try:
        while discover_mode:
            try:
                command, adr = current_socket.recvfrom(1024)
                txt = str(command, "utf-8").strip()

                if txt == "start":
                    cyberpi.console.println("Discovery Mode started")
                    
                    speed = 20
                    speed_factor = 0.29
                    counter = 1
                    discovery_socket = create_socket()  # Separate socket for sending data
                    
                    try:
                        while discover_mode:
                            start_time = time.time()
                            cyberpi.mbot2.forward(speed)
                        
                            while cyberpi.ultrasonic2.get(1) > 10:
                                if not discover_mode:
                                    break
                            
                            cyberpi.mbot2.EM_stop("all")
                        
                            end_time = time.time()
                            duration = end_time - start_time
                            distance = round(duration * speed_factor * 100, 2)
                        
                            cyberpi.console.println("Wand erreicht!")
                            cyberpi.console.println("Punkt " + str(counter) + ": " + str(distance) + "cm")
                        
                            angle = random.randint(0, 360)
                            point = (counter, distance, angle)
                            
                            # Send using the separate socket
                            try:
                                discovery_socket.sendto(str(point).encode(), (backend_ip, 5555))
                                cyberpi.console.println("Data sent to backend!")
                            except Exception as e:
                                cyberpi.console.println("Error sending data!")
                            
                            counter += 1
                            cyberpi.mbot2.turn(angle)
                            time.sleep(1)
                    finally:
                        close_socket(discovery_socket)

                elif txt == "stop":
                    cyberpi.mbot2.EM_stop("all")
                    cyberpi.console.println("Discovery Mode stopped")

                elif txt == "exit":
                    discover_mode = False
                    cyberpi.console.println("Exiting Discovery Mode..")
                    break
            except usocket.timeout:
                continue
    finally:
        close_socket(current_socket)
        current_socket = None

def send_to_backend(sock, data):
    try:
        sock.sendto(data.encode(), (backend_ip, 5555))
        cyberpi.console.println("Data sent to backend!")
    except Exception as e:
        cyberpi.console.println("Error sending data to backend!")

def change_color(txt):
    color_data = txt.split(":")[1]
    if color_data != "null":
        color_data = color_data.split(",")
        cyberpi.led.on(int(color_data[0]), int(color_data[1]), int(color_data[2]))
    else:
        cyberpi.led.off()

# Main initialization
cyberpi.led.on(0, 0, 255)
time.sleep(2)
cyberpi.led.on(255, 255, 255)
time.sleep(0.1)
cyberpi.led.on(0, 0, 0)

connection_count = 0
main_socket = network_module()

try:
    while True:
        try:
            command, adr = main_socket.recvfrom(1024)
            txt = str(command, "utf-8").strip()
            
            if txt.startswith("connect"):
                if connection_count == 0:
                    cyberpi.console.clear()
                connection_count += 1
                host_ip = txt.split(":")[1]
                cyberpi.console.println("Connection " + str(connection_count))
                cyberpi.console.println(host_ip)
            elif txt.startswith("color:"):
                change_color(txt)
            elif txt.startswith("speed:"):
                new_speed = int(txt.split(":")[1])
                if 0 <= new_speed <= 100:
                    movement_speed = new_speed
                    cyberpi.console.println("Speed: " + str(new_speed) + "%")
            elif txt == "controller" and not physical_mode:
                physical_module(movement_speed)
            elif txt == "automatic" and not automatic_mode:
                automatic_module(movement_speed)
            elif txt == "discovery" and not discover_mode:
                discover_module()
        except usocket.timeout:
            continue
        time.sleep(0.1)
finally:
    close_socket(main_socket)