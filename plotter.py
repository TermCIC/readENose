import matplotlib.pyplot as plt
from settings import *

def plot(time_data, sensor_data, treatment, plot_file_path):
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
    plt.savefig(plot_file_path)