import cyberpi
import time
import usocket  # type: ignore
import os
import heapq

# Variables
movement_speed = 50
tracking_enabled = False  # To track whether "start" has been received

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

def mapping(start_x, start_y):
    visited[start_x][start_y] = 1  # Mark the start point as visited
    
    while all_spots_visited() == False:
        target = find_next_target()
        
        
        

def find_next_target():
    for row_index, row in enumerate(visited):
        for col_index, value in enumerate(row):
            if value == 0:
                return row_index, col_index
    return None

def all_spots_visited():
    for row in visited:
        for elem in row:
            if elem == 1 or elem == 2:
                return True
    return False
    
    
def move_straight():
    cyberpi.mbot2.forward(20)
    time.sleep(1)
    cyberpi.mbot2.EM_stop("all")

def turn_right():
    cyberpi.mbot2.turn(90)

def turn_left():
    cyberpi.mbot2.turn(-90)
    

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
            row.append(1)  
        visited.append(row)

    cyberpi.console.println("Room size detected: " + str(width) + "x" + str(height))

    # Start algorithm to explore and drive through the room map
    mapping(0, 0) 

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
