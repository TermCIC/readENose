from settings import *
import numpy as np


def reg(sensor_data, time_data):
    # Convert time_data to a NumPy array
    time_data = np.array(time_data)

    # Calculate slopes for linear model where intercept is zero)
    slopes = []

    for sensor in sensor_data:
        # Perform linear regression with intercept set to zero
        b, _, _, _ = np.linalg.lstsq(time_data[:, np.newaxis], sensor, rcond=None)
        slopes.append(b[0])

    return slopes


def predict(slopes, time_pass):
    predictions = []
    for b in slopes:
        # Calculate the linear prediction with intercept zero
        prediction = b * time_pass
        predictions.append(prediction)
    return predictions


def sampling(duration, wait, slopes=None):
    # Set the serial connection to the appropriate COM port
    try:
        ser = serial.Serial(working_port, 9600)
        print(f"Using COM port: {working_port}")
    except (serial.SerialException, OSError) as e:
        print(f"Failed to open serial port {working_port}. Error: {e}")
        exit(1)

    print(f"Wait for {wait} seconds before sampling...")
    for i in range(wait):
        print(f"{i + 1}/{wait}")
        time.sleep(1)

    print(f"Sampling started...")

    time_data = []
    sensor_data = [[] for _ in range(13)]
    start_time = time.time()
    records = []
    intercept_values = [None for _ in range(13)]
    while time.time() - start_time < (duration + 5):
        if ser.in_waiting > 0:
            line = ser.readline()
            try:
                time_remaining = int((duration + 5) - (time.time() - start_time))
                decoded_line = line.decode('utf-8').rstrip()
                data = [float(x) for x in decoded_line.split(",")]
                if len(data) == 13:
                    records.append(data)

                if len(records) == 10:
                    time_pass = time.time() - start_time
                    median = np.median(records, axis=0).tolist()
                    epsilon = 1e-10
                    for i in range(9):
                        median[i] = np.log(max(median[i], epsilon))
                    for i in range(9, 13):
                        median[i] = np.log(max(median[i], epsilon))

                    adjusted_median = median
                    for i in range(13):
                        if intercept_values[i] is None:
                            intercept_values[i] = median[i]

                        adjusted_median[i] = median[i] - intercept_values[i]

                        if slopes:
                            predictions = predict(slopes, time_pass)
                            adjusted_median[i] -= predictions[i]

                    time_data.append(time_pass)

                    for i in range(13):
                        sensor_data[i].append(adjusted_median[i])

                    formatted_median = [f"{value:.4f}" for value in adjusted_median]
                    print(f"Median values: {formatted_median}; {time_remaining} seconds left...")
                    records = []

            except ValueError:
                print("ValueError - could not convert data to float:", line)
            except UnicodeDecodeError:
                print("UnicodeDecodeError - raw data:", line)

    ser.close()
    print("Serial connection closed.")
    return sensor_data, time_data
