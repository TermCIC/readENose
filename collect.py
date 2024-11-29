import os
import pandas as pd
from tkinter import Tk
from tkinter.filedialog import askopenfilenames

# Initialize Tkinter and hide the main window
root = Tk()
root.withdraw()

# Open file dialog to select CSV files
file_paths = askopenfilenames(filetypes=[("CSV files", "*.csv")], title="Select CSV files to combine")

# Create an empty list to store dataframes
dataframes = []

# Loop through each selected CSV file
for file in file_paths:
    # Read the CSV file into a dataframe
    df = pd.read_csv(file)

    # Extract the treatment name from the filename (remove the .csv extension)
    treatment_name = os.path.splitext(os.path.basename(file))[0]

    # Add the treatment column to the dataframe
    df['treatment'] = treatment_name

    # Append the dataframe to the list
    dataframes.append(df)

# Concatenate all dataframes in the list
if dataframes:
    combined_df = pd.concat(dataframes, ignore_index=True)

    # Save the combined dataframe to a new CSV file
    combined_df.to_csv('combined_data.csv', index=False)

    print("Data from selected CSV files have been combined into 'combined_data.csv'.")
else:
    print("No files were selected.")
