import cyberpi
import time
import usocket  # type: ignore
import os
import heapq

# Variables
movement_speed = 50
tracking_enabled = False  # To track whether "start" has been received
x_pos, y_pos = 0, 0
direction = 1  # Startet nach rechts (Osten)

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
    socket.bind((sockaddr, 6666))
    
    return socket
    
def measure_dimension(direction):
    counter = 0
    while cyberpi.ultrasonic2.get(1) > 10:  # Falls kein Hindernis in 10cm
        cyberpi.mbot2.forward(20)
        time.sleep(1)  # 1 Sekunde fahren
        cyberpi.mbot2.EM_stop("all")
        counter = counter + 1
    
    if direction == "height":
        cyberpi.mbot2.turn(90)
        time.sleep(1)
    
    return counter

# Simulierte Bewegungsfunktionen (statt CyberPi)
def move_forward():
    global x_pos, y_pos, direction
    if direction == 0:  # Norden
        y_pos -= 1
    elif direction == 1:  # Osten
        x_pos += 1
    elif direction == 2:  # Süden
        y_pos += 1
    elif direction == 3:  # Westen
        x_pos -= 1

    cyberpi.mbot2.forward(20)
    time.sleep(1)

def move_backwards():
    global x_pos, y_pos, direction
    if direction == 0:  # Norden
        y_pos += 1
    elif direction == 1:  # Osten
        x_pos -= 1
    elif direction == 2:  # Süden
        y_pos -= 1
    elif direction == 3:  # Westen
        x_pos += 1

    cyberpi.mbot2.backward(20)
    time.sleep(1)

def turn_right():
    global direction
    direction = (direction + 1) % 4  # 0=N, 1=E, 2=S, 3=W
    cyberpi.mbot2.turn(90)
    time.sleep(1)

def turn_left():
    global direction
    direction = (direction - 1) % 4  # 0=N, 1=E, 2=S, 3=W
    cyberpi.mbot2.turn(-90)
    time.sleep(1)

def obstacle_detected():
    return False

def mapping():
    global x_pos, y_pos, direction
    
    for y in range(height):  
        for x in range(width - 1):  
            if obstacle_detected():
                room_map[y_pos][x_pos] = 1  # Hindernis speichern
                cyberpi.mbot2.println("Hindernis an " + str(x_pos) + str(y_pos))
            move_forward()
        
        # Am Ende einer Reihe nach unten bewegen
        if y < height - 1:
            if direction == 1:  # Wenn nach rechts bewegt wurde
                turn_right()
                move_forward()
                turn_right()
            else:  # Wenn nach links bewegt wurde
                turn_left()
                move_forward()
                turn_left()
    print("Raum erkundet!")
    

def physical_module(socket, speed=50):
    global start_initialized
    cyberpi.console.println("Control Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "exit":
            cyberpi.mbot2.EM_stop("all")
            start_initialized = False
            cyberpi.console.println("Exiting Mode..")
            break 
        elif txt == "start":
            start_initialized = True
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
                speed = new_speed
                cyberpi.console.println("Speed: " + str(new_speed) + "%")
            else:
                cyberpi.console.println("Invalid speed!")
                continue
        
        if start_initialized and txt in ["forward", "backward", "left", "right"]:
            if txt == "forward":
                cyberpi.mbot2.forward(speed)
            elif txt == "backward":
                cyberpi.mbot2.backward(speed)
            elif txt == "left":
                cyberpi.mbot2.turn_left(speed)
            elif txt == "right":
                cyberpi.mbot2.turn_right(speed)
        time.sleep(0.1)

def automatic_module(socket, speed=50):
    start_initialized = True
    cyberpi.console.println("Automatic Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "exit":
            cyberpi.mbot2.EM_stop("all")
            start_initialized = False
            cyberpi.console.println("Exiting Automatic Mode..")
            break 
        elif txt == "stop":
            cyberpi.mbot2.EM_stop("all")
            continue
        elif txt.startswith("color:"):
            change_color(txt)
        elif txt.startswith("speed:"):
            new_speed = int(txt.split(":")[1])
            if 0 <= new_speed <= 100:
                speed = new_speed
                cyberpi.console.println("Speed: " + str(new_speed) + "%")
            else:
                cyberpi.console.println("Invalid speed!")
                continue
        
        if start_initialized and txt in ["forward", "backward", "left", "right"]:
            if txt == "forward":
                cyberpi.mbot2.forward(speed)
            elif txt == "backward":
                cyberpi.mbot2.backward(speed)
            elif txt == "left":
                cyberpi.mbot2.turn_left(speed)
            elif txt == "right":
                cyberpi.mbot2.turn_right(speed)
        time.sleep(0.1)

def discover_module():
    global height, width, room_map, visited
    cyberpi.console.println("Discovery Mode: Raum Mapping")
    
    height = measure_dimension("height")  # Measure height
    width = measure_dimension("width")  # Measure width

    # Initialize room map with zeros (free space)
    room_map = []  
    for _ in range(height):  
        row = []  
        for _ in range(width):  
            row.append(0)  
        room_map.append(row) 
     
    visited = []  
    for _ in range(height):  
        row = []  
        for _ in range(width):  
            row.append(0)  
        visited.append(row)
    
    visited[0][0] = 1


    cyberpi.console.println("Room size detected: " + str(width) + "x" + str(height))

    # Start algorithm to explore and drive through the room map
    mapping() 

    # After the BFS exploration, print the map
    # cyberpi.console.println("Mapped Room:")
    # for row in room_map:
        #cyberpi.console.println(" ".join(str(cell) for cell in row))

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

physical_mode = False
discover_mode = False
automatic_mode = False
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
        physical_mode = True
        physical_module(socket, movement_speed)

    elif txt == "automatic" and not automatic_mode:
        automatic_mode = True
        automatic_module(socket, movement_speed)

    elif txt == "discovery" and not discover_mode:
        discover_mode = True
        discover_module()
