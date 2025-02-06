import frontend_bridge as feb

def main(): 
    print('MBOT-G1 Backend')
    frontend_bridge = feb.FrontendBridge()
    frontend_bridge.start_server()
    frontend_bridge.receive_commands()

main()