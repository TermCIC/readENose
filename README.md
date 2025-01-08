![image](https://github.com/user-attachments/assets/625b3b78-bd25-455d-aaaa-3007cfad4973)

Short Description for the Code
This Python script is a tool for adjusting and analyzing readings from low-cost VOC sensors (MQ series and GM series). Developed by Dr. Chun-I Chiu at Chiang Mai University's Faculty of Agriculture, the program assists in calculating slope adjustments for sensor readings over time to improve accuracy.

Features:
Data Sampling and Processing:

Collects real-time sensor data before and after a treatment is applied.
Computes the difference in slopes between baseline (control) and treatment sensor readings.
Data Export:

Saves raw sensor readings and computed slope adjustments into separate CSV files for further analysis.
Visualization:

Plots sensor readings over time, saving the plot as a PNG file labeled with the treatment name.
Automation:

Includes a waiting mechanism to allow sensor recovery before processing the next sample.
The program is designed to streamline the analysis and calibration of VOC sensors, particularly for research and agricultural applications. It requires user input for the treatment name and guides the user through each step of the process.
