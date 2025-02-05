import cyberpi
import time
import usocket
import ujson
import os
 
#Variablen
isConnected = False
movement_speed = 50

def network_module():
    #Den MBOT mit dem Schul-WLAN verbinden
    cyberpi.network.config_sta("htljoh-public", "joh12345")
    #Die Lichter blinken so lange rot, bis der MBOT verbunden ist
    
    while True:
        cyberpi.console.clear()
        cyberpi.console.print("Configuring Network")
        isConnected = cyberpi.network.is_connect()
        if isConnected == False:    
            cyberpi.led.on(255,0, 0)
            cyberpi.console.print(".")
            time.sleep(1)
            cyberpi.console.print(".")
            time.sleep(1)
            cyberpi.console.print(".")
            time.sleep(1)
        else:
            cyberpi.console.clear()
            cyberpi.led.on(0,255, 0)
            cyberpi.console.println("Network Configured")
            break
        
    #Sockadresse wird zugewiesen
    sockaddr = cyberpi.network.get_ip()
    cyberpi.console.println(sockaddr)
 
    #Gateway wird zugewiesen
    gateway = cyberpi.network.get_gateway()
    cyberpi.console.println(gateway)
 
    socket = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
    socket.bind ((sockaddr, 6666))
    i =1
    
    return socket, i

def physical_module(physical_mode, speed=50):
    cyberpi.console.println("--- Physical-Controller Mode ---")

    # Process commands for physical mode
    prev_txt = ""
    last_printed_speed = None  # Variable to store the last printed speed
    
    while physical_mode:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "exit":
            cyberpi.console.println("Exiting Mode...")
            physical_mode = False  # Exit physical mode
            break 

        if txt.startswith("speed:"):
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

def discover_module(discover_mode):
    # Logic for discovery mode if needed
        cyberpi.console.println("--- Discovery Mode ---")
        pass


cyberpi.led.on(0, 0,255)
cyberpi.console.println("MBOT Grp. 1")
time.sleep(2)

socket, i = network_module()
i += 1

time.sleep(1)
cyberpi.led.on(255,255, 255)
time.sleep(0.1)
cyberpi.led.on(0,0, 0)


# Modes
physical_mode = False  # Initially not in physical mode
discover_mode = False


# Main Loop
while True:
    
    # Receive the command and address
    command, adr = socket.recvfrom(1024)
    txt = str(command, "utf-8")  # Convert the byte command to string
    
    if txt.startswith("speed:"):
            new_speed = int(txt.split(":")[1])  # Extract number and convert to int

            if 0 <= new_speed <= 100:  # Ensure speed is within range
                movement_speed = new_speed  # Update speed value
                cyberpi.console.println("Speed: " + str(new_speed) + "%")
            else:
                cyberpi.console.println("Invalid speed!")
                continue  # Ignore and wait for the next command
    
    if txt == "controller" and not physical_mode:
        physical_mode = True  # Switch to physical mode
    elif txt == "discovery" and not discover_mode:
        discover_mode = True # Switch to discovery mode
   
    
    
    elif txt == "exit" and physical_mode:
        cyberpi.console.println("Exiting Physical-Mode...")
        physical_mode = False  # Exit physical mode
    elif txt == "exit" and discover_mode:
        cyberpi.console.println("Exiting Discovery-Mode...")
        discover_mode = False  # Exit discovery mode

    
    if physical_mode:
        physical_module(physical_mode, movement_speed)

    elif discover_mode:
        discover_module(discover_mode)
