import cyberpi
import time
import usocket  # type: ignore
import os
import random

# Variables
movement_speed = 50
tracking_enabled = False  # To track whether "start" has been received

physical_mode = False
discover_mode = False
automatic_mode = False

def network_module():
    # Connect the MBOT to the school Wi-Fi
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
        
    # Assign socket address
    sockaddr = cyberpi.network.get_ip()
    cyberpi.console.println("My IP Address: " + sockaddr)
    cyberpi.console.println("--------------")
    cyberpi.console.println("Waiting for Host")
 
    socket = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
    socket.setsockopt(usocket.SOL_SOCKET, usocket.SO_REUSEADDR, 1)  # Allow address reuse
    socket.bind((sockaddr, 6666))
    
    return socket

# Reuse the same socket instance across all modules
socket = network_module()

def physical_module(socket, speed=50):
    global physical_mode
    global movement_speed
    global tracking_enabled
x
    physical_mode = True
    cyberpi.console.println("Control Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "exit":
            cyberpi.mbot2.EM_stop("all")
            physical_mode = False  # Exit the mode
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
            else:
                cyberpi.console.println("Invalid speed!")
                continue
        
        if tracking_enabled and txt in ["forward", "backward", "left", "right"]:
            if txt == "forward":
                cyberpi.mbot2.forward(movement_speed)
            elif txt == "backward":
                cyberpi.mbot2.backward(movement_speed)
            elif txt == "left":
                cyberpi.mbot2.turn_left(movement_speed)
            elif txt == "right":
                cyberpi.mbot2.turn_right(movement_speed)
        time.sleep(0.1)

def automatic_module(socket, speed=50):
    global automatic_mode
    global movement_speed

    automatic_mode = True
    cyberpi.console.println("Automatic Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "exit":
            cyberpi.mbot2.EM_stop("all")
            automatic_mode = False  # Exit the mode
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
            else:
                cyberpi.console.println("Invalid speed!")
                continue
        
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
        time.sleep(0.1)

def discover_module(socket):
    global discover_mode

    discover_mode = True
    cyberpi.console.println("Discovery Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "start":
            cyberpi.console.println("Discovery Mode started")
            
            # Discovery Logic
            speed = 20
            speed_factor = 0.29  # 1 Speed = lt. Messung: 17,4cm/min
        
            counter = 1
        
            while True:
                # Non-blocking check for "stop" command
                socket.settimeout(1)  # Set a timeout of 1 second for non-blocking behavior
                try:
                    stop_command, _ = socket.recvfrom(1024)
                    if stop_command.decode("utf-8").strip() == "stop":
                        cyberpi.mbot2.EM_stop("all")
                        discover_mode = False
                        cyberpi.console.println("Discovery Mode stopped")
                        socket.settimeout(None)  # Reset to blocking mode
                        return  # Exit the function
                except Exception:
                    pass  # Timeout occurred, continue with discovery logic

                start_time = time.time()
                cyberpi.mbot2.forward(speed)
            
                while cyberpi.ultrasonic2.get(1) > 10:
                    # Check for "stop" command during obstacle detection
                    try:
                        stop_command, _ = socket.recvfrom(1024)
                        if stop_command.decode("utf-8").strip() == "stop":
                            cyberpi.mbot2.EM_stop("all")
                            discover_mode = False
                            cyberpi.console.println("Discovery Mode stopped")
                            socket.settimeout(None)  # Reset to blocking mode
                            return  # Exit the function
                    except Exception:
                        pass  # Timeout occurred, continue moving

                cyberpi.mbot2.EM_stop("all")
            
                end_time = time.time()
                duration = end_time - start_time
                distance = round(duration * speed_factor * 100, 2)  # cm
            
                cyberpi.console.println("Wand erreicht!")
                cyberpi.console.println("Punkt " + str(counter) + ": " + str(distance) + "cm")
            
                angle = random.randint(0, 360)
            
                # Create a single detection point
                point = (counter, distance, angle)
                
                # Send the single detection point to the backend
                backend_ip = "10.10.0.103"
                send_to_backend(socket, backend_ip, point)  # Pass the tuple directly
                
                counter += 1
            
                cyberpi.mbot2.turn(angle)
            
                time.sleep(1)

        if txt == "stop":
            cyberpi.mbot2.EM_stop("all")
            discover_mode = False  # Stop discovery mode
            cyberpi.console.println("Discovery Mode stopped")
            break

        if txt == "exit":
            discover_mode = False  # Exit the mode
            cyberpi.console.println("Exiting Discovery Mode..")
            break

    # Reset the socket timeout to blocking mode before exiting
    socket.settimeout(None)

def send_to_backend(socket, backend_ip, data):
    try:
        # Ensure data is a string before sending
        if isinstance(data, tuple):
            data = str(data)  # Convert tuple to string
        socket.sendto(data.encode(), (backend_ip, 5555))
        cyberpi.console.println("Data sent to backend!")
    except Exception as e:
        cyberpi.console.println(f"Error sending data to backend: {e}")

def change_color(txt):
    color_data = txt.split(":")[1]
    if color_data != "null":
        color_data = color_data.split(",")
        cyberpi.led.on(int(color_data[0]), int(color_data[1]), int(color_data[2]))
    else:
        cyberpi.led.off()

cyberpi.led.on(0, 0, 255)
cyberpi.console.println("MBOT Grp. 1")
time.sleep(2)

time.sleep(1)
cyberpi.led.on(255, 255, 255)
time.sleep(0.1)
cyberpi.led.on(0, 0, 0)

connection_count = 0

while True:
    command, adr = socket.recvfrom(1024)
    txt = str(command, "utf-8")
    
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
        else:
            cyberpi.console.println("Invalid speed!")
            continue
    elif txt == "controller" and not physical_mode:
        physical_module(socket, movement_speed)

    elif txt == "automatic" and not automatic_mode:
        automatic_module(socket, movement_speed)

    elif txt == "discovery" and not discover_mode:
        discover_module(socket)