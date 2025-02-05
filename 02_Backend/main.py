import mbot_bridge as mbb

def main(): 
    print('MBOT-G1 Backend')
    mbot_bridge = mbb.MBotBridge()


    mbot_bridge.configure_connection('10.10.3.188')

    

    mbot_bridge.send_message('speed:100')


    #mbot_bridge.send_message('controller')
    #mbot_bridge.send_message('left')

    #mbot_bridge.send_message('stop ')
    
    # mbot_bridge.receive_message()






main()