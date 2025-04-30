import service_manager as sm

# This is the main entry point for the MBOT-G1 Backend application.
# Swagger UI is served at host_ip:server_port/swagger
# By default that would be http://localhost:8080/swagger

def main():
    print('MBOT-G1 Backend')
    service_manager = sm.ServiceManager() # Could take server_port and host_ip as arguments
    service_manager.start_server()
main()