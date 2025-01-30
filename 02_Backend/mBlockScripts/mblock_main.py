import cyberpi
import time
import usocket
import ujson
import os
 
#Variablen
isConnected = False
networkEnabled = True
 
cyberpi.led.on(0, 0,255)
cyberpi.console.println("MBOT Grp. 1")
 
#Den MBOT mit dem Schul-WLAN verbinden
cyberpi.network.config_sta("htljoh-public", "joh12345")
 
#Die Lichter blinken so lange rot, bis der MBOT verbunden ist
while True:
    isConnected = cyberpi.network.is_connect()
    if isConnected == False:    
        cyberpi.led.on(255,0, 0)
        time.sleep(1)
    else:
        cyberpi.led.on(0,255, 0)
        break
 
#Sockadresse wird zugewiesen
sockaddr = cyberpi.network.get_ip()
cyberpi.console.println(sockaddr)
 
#Gateway wird zugewiesen
gateway = cyberpi.network.get_gateway()
cyberpi.console.println(gateway)
 
s = usocket.socket(usocket.AF_INET, usocket.SOCK_DGRAM)
s.bind ((sockaddr, 6666))
i =1
 
name = "SUPERPI"
while networkEnabled:
    s.sendto(name, ("10.10.3.255", 1234))
    i += 1
    time.sleep(1)
    cyberpi.led.on(255,255, 255)
    time.sleep(0.1)
    cyberpi.led.on(0,0, 0)
    
    command, adr = s.recvfrom(1024)
    txt = str(command, "utf-8")
    cyberpi.console.println(txt)
