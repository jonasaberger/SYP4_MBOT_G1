import cyberpi
import time
import usocket
import os

# Variables
movement_speed = 50

def network_module():
    # Connect the MBOT to the school Wi-Fi
    cyberpi.network.config_sta("htljoh-public", "joh12345")
    # The lights blink red until the MBOT is connected
    
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
            break
        
    # Assign socket address
    sockaddr = cyberpi.network.get_ip()
    cyberpi.console.println("IP Address: " + sockaddr)
 
    socket = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
    socket.bind((sockaddr, 6666))
    
    return socket

def physical_module(socket, speed=50):
    cyberpi.console.println("Control Mode")

    # Process commands for physical mode
    prev_txt = ""
    last_printed_speed = None  # Variable to store the last printed speed
    
    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "exit":
            cyberpi.mbot2.EM_stop("all")
            cyberpi.console.println("Exiting Mode..")
            break 

        elif txt.startswith("color:"):
            change_color(txt)
        elif txt.startswith("speed:"):
            new_speed = int(txt.split(":")[1])  # Extract number and convert to int

            if 0 <= new_speed <= 100:  # Ensure speed is within range
                speed = new_speed  # Update speed value
                if last_printed_speed != new_speed:  # Only print if speed has changed
                    cyberpi.console.println("Speed: " + str(new_speed) + "%")
                    last_printed_speed = new_speed  # Update the last printed speed
                txt = prev_txt  # Reapply previous movement command with new speed
            else:
                cyberpi.console.println("Invalid speed!")
                continue  # Ignore and wait for the next command
        
        if txt in ["forward", "backward", "left", "right", "stop"]:
            prev_txt = txt  # Store last valid movement command
        
        # Execute actions based on received commands
        if txt == "forward":
            cyberpi.led.on(0, 255, 0)  # Set LED to green
            cyberpi.mbot2.forward(speed)
        elif txt == "backward":
            cyberpi.led.on(255, 0, 0)  # Set LED to red
            cyberpi.mbot2.backward(speed)
        elif txt == "left":
            cyberpi.mbot2.turn_left(speed)
        elif txt == "right":
            cyberpi.mbot2.turn_right(speed)
        elif txt == "stop":
            cyberpi.mbot2.EM_stop("all")
        
        time.sleep(0.1)  # Small delay to prevent high CPU usage

def discover_module():
    # Logic for discovery mode if needed
    cyberpi.console.println("--- Discovery Mode ---")
    pass

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

socket = network_module()

time.sleep(1)
cyberpi.led.on(255, 255, 255)
time.sleep(0.1)
cyberpi.led.on(0, 0, 0)

# Modes
physical_mode = False  # Initially not in physical mode
discover_mode = False

# Main Loop
while True:
    # Receive the command and address
    command, adr = socket.recvfrom(1024)
    txt = str(command, "utf-8")  # Convert the byte command to string
    
    if txt.startswith("color:"):
        change_color(txt)
    elif txt.startswith("speed:"):
        new_speed = int(txt.split(":")[1])  # Extract number and convert to int

        if 0 <= new_speed <= 100:  # Ensure speed is within range
            movement_speed = new_speed  # Update speed value
            cyberpi.console.println("Speed: " + str(new_speed) + "%")
        else:
            cyberpi.console.println("Invalid speed!")
            continue  # Ignore and wait for the next command
    
    # Control-Commands
    elif txt == "controller" and not physical_mode:
        physical_mode = True  # Switch to physical mode
        physical_module(socket, movement_speed)
    elif txt == "discovery" and not discover_mode:
        discover_mode = True  # Switch to discovery mode
        discover_module()
    elif txt == "exit" and physical_mode:
        cyberpi.console.println("Exiting Physical-Mode...")
        cyberpi.mbot2.EM_stop("all")
        physical_mode = False  # Exit physical mode
    elif txt == "exit" and discover_mode:
        cyberpi.console.println("Exiting Discovery-Mode...")
        cyberpi.mbot2.EM_stop("all")
        discover_mode = False  # Exit discovery mode