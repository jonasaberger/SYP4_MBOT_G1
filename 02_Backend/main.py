import frontend_bridge as feb
import db_bridge as dbb

# ENDPOINTS : /receive_commands

# POST:
# 1. ip-target : string -> IP address of the target mbot
#    |
# 2. mode : string -> mode of the mbot (e.g. "controller", "discovery") | exit the mode by sending "exit"
#    |
# 3. drive : string -> drive command, beforehand input "start" -> (e.g. "forward", "backward", "left", "right", "stop")
# 4. color : string -> color of the mbot (e.g. "255,255,255")
# 5. speed : string -> speed of the mbot (e.g. "1", "100")


# POST : /save_log
# Access this endpoint with the collction name as a parameter to save the command log to the database

def main(): 
    print('MBOT-G1 Backend')
    frontend_bridge = feb.FrontendBridge()
    frontend_bridge.start_server()
    frontend_bridge.receive_commands()
    
main()