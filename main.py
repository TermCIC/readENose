# This is a simple software to adjust the readings of low-cost VOC sensors: MQ series and GM series
# This program is written by Dr. Chun-I Chiu, Faculty of Agriculture, Chiang Mai University
# Latest update 2024/06/29

import csv

import matplotlib.pyplot as plt

from sampling import *


def plot(time_data, sensor_data):
    # Plotting the sensor readings over time
    plt.figure(figsize=(10, 6))
    for i in range(13):
        plt.plot(time_data, sensor_data[i], label=sensor_list[i])

    plt.xlabel('Time (seconds)')
    plt.ylabel('Sensor Readings (%, Reading/Maximum Reading)')
    plt.title(f'{treatment}')
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.5),
               fontsize='small')  # Align legend to right side and set font size
    plt.ylim(-0.1, 0.1)  # Setting the y-axis limits from 0 to 100
    plt.savefig(f'{treatment}_sensor_readings.png')
    plt.show()


def run(treatment):
    print("Start to calculate slope and intercepts...")
    pre_sensor_data, pre_time_data = sampling(100, 1)
    control_slopes = reg(pre_sensor_data, pre_time_data)
    input("Please place sample and input enter to continue...")
    sensor_data, time_data = sampling(100, 1)
    treatment_slopes = reg(sensor_data, time_data)
    diff_slopes = []
    for i in range(len(control_slopes)):
        diff_slopes.append(treatment_slopes[i] - control_slopes[i])

    sample_size = len(sensor_data[0])
    with open(f'{treatment}_rough.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headings)
        for row in range(sample_size):
            row_data = [time_data[row]]  # Start with the time_data for the current row
            for sensor in sensor_data:
                row_data.append(sensor[row])  # Append the sensor data for the current row
            writer.writerow([treatment] + row_data)  # Prepend the treatment and write the row

    with open(f'{treatment}_slope.csv', mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headings)
        writer.writerow([treatment, int(time.time())] + diff_slopes)

    plot(time_data, sensor_data)
    print(f"Please remove the sample...")
    for i in range(300):
        print(f"Wait for {i + 1}/300 seconds before next sample...")
        time.sleep(1)


treatment = input("Enter the treatment name: ")
# Sampling parameters
run(treatment)
