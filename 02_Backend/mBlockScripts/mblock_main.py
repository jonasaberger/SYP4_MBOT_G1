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
backend_ip = "10.10.0.103"

def reset_variables():
    global physical_mode, discover_mode, automatic_mode, tracking_enabled, movement_speed
    physical_mode = False
    discover_mode = False
    automatic_mode = False
    tracking_enabled = False
    movement_speed = 50
    cyberpi.mbot2.EM_stop("all")
    cyberpi.led.on(0, 0, 255)
    cyberpi.console.clear()
    cyberpi.console.println("MBOT Grp. 1")
    time.sleep(2)
    cyberpi.console.println("Connect To Host")

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
            cyberpi.console.println("")
            break

    sockaddr = cyberpi.network.get_ip()
    cyberpi.console.println("--------------")
    cyberpi.console.println("My IP Address")
    cyberpi.console.println(sockaddr)
    cyberpi.console.println("--------------")
    cyberpi.console.println("Waiting for Host...")

    socket = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
    socket.setsockopt(usocket.SOL_SOCKET, usocket.SO_REUSEADDR, 1)
    socket.bind((sockaddr, 6666))

    return socket

def physical_module(socket, speed=50):
    global physical_mode, movement_speed, tracking_enabled
    physical_mode = True
    cyberpi.console.println("Control Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt in ["exit", "disconnect"]:
            cyberpi.mbot2.EM_stop("all")
            physical_mode = False
            tracking_enabled = False
            if txt == "disconnect":
                reset_variables()
                return "disconnect"
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
    global automatic_mode, movement_speed
    automatic_mode = True
    cyberpi.console.println("Automatic Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt in ["exit", "disconnect"]:
            cyberpi.mbot2.EM_stop("all")
            automatic_mode = False
            if txt == "disconnect":
                reset_variables()
                return "disconnect"
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
    global backend_ip, discover_mode
    discover_mode = True
    cyberpi.console.println("Discovery Mode")

    while True:
        command, adr = socket.recvfrom(1024)
        txt = str(command, "utf-8").strip()

        if txt == "start":
            cyberpi.console.println("Discovery Mode started")
            speed = 20
            speed_factor = 0.29
            counter = 1
            while True:
                socket.settimeout(1)
                try:
                    stop_command, _ = socket.recvfrom(1024)
                    stop_txt = stop_command.decode("utf-8").strip()
                    if stop_txt == "stop" or stop_txt == "disconnect":
                        cyberpi.mbot2.EM_stop("all")
                        discover_mode = False
                        cyberpi.console.println("Discovery Mode stopped")
                        socket.settimeout(None)
                        # Send "stop" to backend before returning
                        send_to_backend(socket, backend_ip, "stop")
                        if stop_txt == "disconnect":
                            reset_variables()
                            return "disconnect"
                        return
                except Exception:
                    pass

                start_time = time.time()
                cyberpi.mbot2.forward(speed)
                while cyberpi.ultrasonic2.get(1) > 10:
                    try:
                        stop_command, _ = socket.recvfrom(1024)
                        stop_txt = stop_command.decode("utf-8").strip()
                        if stop_txt == "stop" or stop_txt == "disconnect":
                            cyberpi.mbot2.EM_stop("all")
                            discover_mode = False
                            cyberpi.console.println("Discovery Mode stopped")
                            socket.settimeout(None)
                            # Send "stop" to backend before returning
                            send_to_backend(socket, backend_ip, "stop")
                            if stop_txt == "disconnect":
                                reset_variables()
                                return "disconnect"
                            return
                    except Exception:
                        pass

                cyberpi.mbot2.EM_stop("all")
                end_time = time.time()
                distance = round((end_time - start_time) * speed_factor * 100, 2)
                cyberpi.console.println("Punkt " + str(counter) + ": " + str(distance) + "cm")
                angle = random.randint(0, 360)
                point = (counter, distance, angle)
                send_to_backend(socket, backend_ip, point)
                counter += 1
                cyberpi.mbot2.turn(angle)
                time.sleep(1)

            # After the while True loop, send "stop" to backend (if not already sent)
            send_to_backend(socket, backend_ip, "stop")

        elif txt == "stop":
            cyberpi.mbot2.EM_stop("all")
            discover_mode = False
            # Send "stop" to backend
            send_to_backend(socket, backend_ip, "stop")
            break

        elif txt == "disconnect":
            # Send "stop" to backend
            send_to_backend(socket, backend_ip, "stop")
            reset_variables()
            return "disconnect"

        elif txt == "exit":
            discover_mode = False
            # Send "stop" to backend
            send_to_backend(socket, backend_ip, "stop")
            break

    socket.settimeout(None)

def send_to_backend(socket, backend_ip, data):
    try:
        if isinstance(data, tuple):
            data = str(data)
        socket.sendto(data.encode(), (backend_ip, 5555))
        cyberpi.console.println("Data sent to backend!")
    except Exception as e:
        cyberpi.console.println("Error sending data to backend " + e)

def change_color(txt):
    color_data = txt.split(":")[1]
    if color_data != "null":
        color_data = color_data.split(",")
        cyberpi.led.on(int(color_data[0]), int(color_data[1]), int(color_data[2]))
    else:
        cyberpi.led.off()

# Boot-up indicator
cyberpi.led.on(0, 0, 255)
cyberpi.console.println("MBOT Grp. 1")
time.sleep(2)
cyberpi.led.on(255, 255, 255)
time.sleep(0.1)
cyberpi.led.on(0, 0, 0)

# Main Loop
while True:
    socket = network_module()
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

        elif txt == "disconnect":
            reset_variables()
            break

        elif txt.startswith("color:"):
            change_color(txt)

        elif txt.startswith("speed:"):
            new_speed = int(txt.split(":")[1])
            if 0 <= new_speed <= 100:
                movement_speed = new_speed
            else:
                cyberpi.console.println("Invalid speed!")
                continue

        elif txt == "controller" and not physical_mode:
            result = physical_module(socket, movement_speed)
            if result == "disconnect":
                break

        elif txt == "automatic" and not automatic_mode:
            result = automatic_module(socket, movement_speed)
            if result == "disconnect":
                break

        elif txt == "discovery" and not discover_mode:
            result = discover_module(socket)
            if result == "disconnect":
                break