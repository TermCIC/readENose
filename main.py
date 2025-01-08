# This is a simple software to adjust the readings of low-cost VOC sensors: MQ series and GM series
# This program is written by Dr. Chun-I Chiu, Faculty of Agriculture, Chiang Mai University
# Latest update 2025/01/08

import csv
import json
import eel
from sampling import *
from plotter import *
import os

# Global variables
working_port = find_working_port()
choose = None

eel.init("web", allowed_extensions=['.html', '.js', '.json'])

@eel.expose
def get_measure_duration():
    return measure_duration

@eel.expose
def get_current_readings(selected_port):
    readings = read_port_from_file()[selected_port].get("readings")
    return json.dumps(readings)


@eel.expose
def get_current_logs(selected_port):
    logs = read_port_from_file()[selected_port].get("log")
    return logs


@eel.expose
def measure_control_air(selected_port):
    sampling_thread(selected_port, measure_duration, 1)


@eel.expose
def calculate_control_slope(selected_port):
    ports = read_port_from_file()
    pre_sensor_data = ports[selected_port]["sensor_data"]
    pre_time_data = ports[selected_port]["time_data"]
    control_slopes = reg(pre_sensor_data, pre_time_data)
    ports = read_port_from_file()
    ports[selected_port]["log"].append(f"Control slopes: {control_slopes}")
    ports[selected_port]["control_slopes"] = control_slopes
    save_port_to_file(ports)


@eel.expose
def measure_sample_air(selected_port):
    sampling_thread(selected_port, measure_duration, 1)


@eel.expose
def calculate_sample_slope(selected_port, treatment_name):
    ports = read_port_from_file()
    sensor_data = ports[selected_port]["sensor_data"]
    time_data = ports[selected_port]["time_data"]
    treatment_slopes = reg(sensor_data, time_data)
    
    ports[selected_port]["log"].append(f"Treatment slopes: {treatment_slopes}")
    ports[selected_port]["treatment_slopes"] = treatment_slopes
    diff_slopes = []
    for i in range(len(ports[selected_port]["control_slopes"])):
        diff_slopes.append(treatment_slopes[i] - ports[selected_port]["control_slopes"][i])
    ports[selected_port]["diff_slopes"] = diff_slopes
    
    # Create a folder for the treatment
    folder_name = treatment_name
    os.makedirs(folder_name, exist_ok=True)
    
    sample_size = len(sensor_data[0])
    rough_file_path = os.path.join(folder_name, f'{treatment_name}_rough.csv')
    with open(rough_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headings)
        for row in range(sample_size):
            row_data = [time_data[row]]  # Start with the time_data for the current row
            for sensor in sensor_data:
                row_data.append(sensor[row])  # Append the sensor data for the current row
            writer.writerow([treatment_name] + row_data)  # Prepend the treatment and write the row

    slope_file_path = os.path.join(folder_name, f'{treatment_name}_slope.csv')
    with open(slope_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headings)
        writer.writerow([treatment_name, int(time.time())] + diff_slopes)

    # Save the plot in the treatment folder
    plot_file_path = os.path.join(folder_name, f'{treatment_name}_sensor_readings.png')
    plot(time_data, sensor_data, treatment_name, plot_file_path)

    ports[selected_port]["log"].append(f"Data saved in folder: {folder_name}")
    ports[selected_port]["log"].append(f"Please remove the sample...")
    save_port_to_file(ports)


@eel.expose
def update_status():
    # Read ports data
    ports = read_port_from_file()
    ports_json = json.dumps(ports)
    result = {
        "ports": ports_json
    }
    # Return as JSON string
    return json.dumps(result)


# Start the index.html file
eel.start("ui.html")