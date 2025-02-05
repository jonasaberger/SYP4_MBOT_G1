import mbot_bridge as mbb

def main(): 
    print('MBOT-G1 Backend')
    mbot_bridge = mbb.MBotBridge()
    #mbot_bridge.configure_connection('10.10.3.188')
    #mbot_bridge.send_message('discovery')
    mbot_bridge.start_server()


main()