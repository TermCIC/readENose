import serial
import json
import serial.tools.list_ports
import os
import platform
import time
import importlib as imp

# Detect OS
current_os = platform.system()
print(f"OS is {current_os}")

PORT_FILE = 'port.json'


# Function to find the working COM port
def find_working_port():
    if current_os == "Windows":
        ports = [port.name for port in serial.tools.list_ports.comports()]
    else:
        ports = [port.device for port in serial.tools.list_ports.comports()]
    for port in ports:
        try:
            print(f"Checking port {port}...")
            ser = serial.Serial(port, 9600, timeout=3)
            ser.flushInput()  # Clear input buffer to avoid reading stale data
            ser.flushOutput()  # Clear output buffer
            time.sleep(1)  # Give some time for the port to initialize
            ser.write(b'Hello')  # Send a dummy byte to trigger response
            time.sleep(1)  # Give some time for the response
            if ser.in_waiting > 0:  # Check if there is data waiting
                response = ser.readline()  # Read a line to flush the buffer
                ser.close()
                if response:  # Check if the response is valid
                    print(f"Serial port detected: {port}")
                    return port
            ser.close()
        except (serial.SerialException, OSError) as e:
            print(f"Port: {port} has no response or is not accessible. Error: {e}")
            continue
    return None


# Function to read port from JSON file
def read_port_from_file():
    if os.path.exists(PORT_FILE):
        with open(PORT_FILE, 'r') as file:
            data = json.load(file)
            return data.get('port')
    return None


# Function to save port to JSON file
def save_port_to_file(port):
    with open(PORT_FILE, 'w') as file:
        json.dump({'port': port}, file)


# Check if port is available
def is_port_available(port):
    try:
        ser = serial.Serial(port, 9600, timeout=3)
        ser.flushInput()  # Clear input buffer to avoid reading stale data
        ser.flushOutput()  # Clear output buffer
        time.sleep(1)  # Give some time for the port to initialize
        ser.write(b'Hello')  # Send a dummy byte to trigger response
        time.sleep(1)  # Give some time for the response
        if ser.in_waiting > 0:  # Check if there is data waiting
            response = ser.readline()  # Read a line to flush the buffer
            ser.close()
            return bool(response)  # Check if the response is valid
        ser.close()
    except (serial.SerialException, OSError):
        return False
    return False


# Try to read the working port from the JSON file
working_port = read_port_from_file()

# If the port is not in the file or is not responding, find a new working port
if not working_port or not is_port_available(working_port):
    print("Finding a new working COM port...")
    working_port = find_working_port()
    if working_port:
        save_port_to_file(working_port)
    else:
        print("No working COM port found.")
        exit(1)

sensor_list = [f"MQ{k}" for k in range(2, 10)] + ["MQ135"] + ["GM102B", "GM302B", "GM502B", "GM702B"]
headings = ["Treatment", "Timestamp"] + sensor_list
