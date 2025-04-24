import cyberpi
import time
import usocket  # type: ignore
import os

# Global variables
movement_speed = 50
tracking_enabled = False
start_initialized = False
height = 0
width = 0
room_map = []
visited = []

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
    while cyberpi.ultrasonic2.get(1) > 10:  # While no obstacle within 10cm
        cyberpi.mbot2.forward(20)
        time.sleep(1)  # Move for 1 second
        cyberpi.mbot2.EM_stop("all")
        counter += 1
        # Additional check to prevent infinite loop
        if counter > 20:  # Safety limit of 20 units
            break
    if direction == "height":
        # Turn 90 degrees to measure the other dimension
        cyberpi.mbot2.turn_right(30)
        time.sleep(3)  # Adjust time for 90 degree turn
        cyberpi.mbot2.EM_stop("all")
    return counter

def discover_module():
    global height, width, room_map, visited
    cyberpi.console.println("Discovery Mode: Raum Mapping")
    
    # Measure dimensions
    height = measure_dimension("height")  # First dimension
    width = measure_dimension("width")    # Second dimension
    
    # Initialize maps
    room_map = [[0 for _ in range(width)] for _ in range(height)]  # 0 = free space
    visited = [[0 for _ in range(width)] for _ in range(height)]   # 0 = unvisited
    
    
    # Start position (assuming corner)
    start_x = 0
    start_y = 0
    visited[start_x][start_y] = 1  # Mark start as visited
    
    # Queue for BFS
    queue = [(start_x, start_y)]
    current_dir = 0  # 0=right, 1=down, 2=left, 3=up
    
    while queue:
        x, y = queue.pop(0)
        
        # Explore adjacent cells
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = x + dx, y + dy
            
            # Check bounds and if not visited
            if 0 <= nx < height and 0 <= ny < width and not visited[nx][ny]:
                # Calculate required turn
                target_dir = [(0, 1), (1, 0), (0, -1), (-1, 0)].index((dx, dy))
                turn_degrees = (target_dir - current_dir) * 90
                
                # Perform turn if needed
                if turn_degrees != 0:
                    if turn_degrees > 180:
                        turn_degrees -= 360
                    elif turn_degrees < -180:
                        turn_degrees += 360
                    
                    if turn_degrees > 0:
                        cyberpi.mbot2.turn_right(30)
                    else:
                        cyberpi.mbot2.turn_left(30)
                    time.sleep(abs(turn_degrees)/90)  # Adjust for 90 degree turn
                    cyberpi.mbot2.EM_stop("all")
                    current_dir = target_dir
                
                # Check for obstacle
                distance = cyberpi.ultrasonic2.get(1)
                if distance > 10:  # No obstacle
                    # Move forward
                    cyberpi.mbot2.forward(20)
                    move_time = 1.0  # Base move time
                    
                    # Adjust for diagonal moves if needed
                    if dx != 0 and dy != 0:
                        move_time *= 1.414  # sqrt(2) for diagonal
                    
                    time.sleep(move_time)
                    cyberpi.mbot2.EM_stop("all")
                    
                    # Update position and maps
                    visited[nx][ny] = 1
                    room_map[nx][ny] = 0
                    queue.append((nx, ny))
                else:
                    # Mark as obstacle
                    room_map[nx][ny] = 1
    
    # Return to start (optional)
    cyberpi.console.println("Mapping complete!")
    
    # Display map
    cyberpi.console.println("Room Map (0=free, 1=obstacle):")
    for row in room_map:
        cyberpi.console.println(" ".join(str(cell) for cell in row))

def physical_module(socket, speed=50):
    global start_initialized
    cyberpi.console.println("Control Mode")
    
    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()
        w
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
    global start_initialized
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
                time.sleep(1)
                cyberpi.mbot2.EM_stop("all")
            elif txt == "backward":
                cyberpi.mbot2.backward(speed)
                time.sleep(1)
                cyberpi.mbot2.EM_stop("all")
            elif txt == "left":
                cyberpi.mbot2.turn_left(speed)
                time.sleep(0.5)  # Shorter time for turning
                cyberpi.mbot2.EM_stop("all")
            elif txt == "right":
                cyberpi.mbot2.turn_right(speed)
                time.sleep(0.5)
                cyberpi.mbot2.EM_stop("all")
        time.sleep(0.1)

def change_color(txt):
    color_data = txt.split(":")[1]
    if color_data != "null":
        color_data = color_data.split(",")
        cyberpi.led.on(int(color_data[0]), int(color_data[1]), int(color_data[2]))
    else:
        cyberpi.led.off()

# Main program
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
        else:
            cyberpi.console.println("Invalid speed!")
            continue
    elif txt == "controller" and not physical_mode:
        physical_mode = True
        physical_module(socket, movement_speed)
        physical_mode = False
    elif txt == "automatic" and not automatic_mode:
        automatic_mode = True
        automatic_module(socket, movement_speed)
        automatic_mode = False
    elif txt == "discovery" and not discover_mode:
        discover_mode = True
        discover_module()
        discover_mode = False
    elif txt == "exit":
        cyberpi.mbot2.EM_stop("all")
        cyberpi.console.println("Exiting program...")
        break