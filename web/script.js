let selected_port = null;
let treatment_name = null;
let is_control_air = false;
let measure_duration = 100;


async function get_measure_duration() {
  try {
    // Fetch the measure duration from the Python backend using Eel
    const duration = await eel.get_measure_duration()();
    // Update the measure_duration variable with the fetched value + 10
    measure_duration = parseInt(duration, 10) + 10;
    console.log(`Updated measure duration: ${measure_duration}`);
  } catch (error) {
    console.error("Error fetching measure duration:", error);
  }
}


// Function to update the status periodically
function update_status() {
  updateSensorReading(selected_port);
  eel.update_status()(function (data) {
    try {
      const parsedData = JSON.parse(data);
      const sensors = parsedData.ports;
      const sensorContainer = document.getElementById("sensorContainer");
      const sensorData = JSON.parse(sensors);
      for (const [key, value] of Object.entries(sensorData)) {
        // Skip if sensor already exists
        if (document.getElementById(`sensor-${key}`)) {
          continue;
        }

        // Create a new sensor box if it doesn't exist
        const sensorDiv = document.createElement("div");
        sensorDiv.className = "sensor-box";
        sensorDiv.id = `sensor-${key}`;
        sensorDiv.style.display = "flex";
        sensorDiv.style.justifyContent = "space-between";
        sensorDiv.style.alignItems = "center";
        sensorDiv.style.border = "1px solid #ccc";
        sensorDiv.style.borderRadius = "5px";
        sensorDiv.style.padding = "5px";
        sensorDiv.style.marginBottom = "5px";

        const leftSection = document.createElement("div");
        leftSection.style.display = "flex";
        leftSection.style.flexDirection = "column";
        leftSection.style.alignItems = "flex-start";
        leftSection.style.textOverflow = "ellipsis";
        leftSection.style.overflow = "hidden";
        leftSection.style.paddingRight = "18px";

        const label = document.createElement("strong");
        label.textContent = `${key}`;
        label.style.marginBottom = "5px";

        const sensorInfo = `
                  <div style="padding-right: 18px; font-size: 12px;">
                      <strong>Type:</strong> ${value.info_1}<br>
                      <strong>ID:</strong> ${value.info_2}<br>
                      <strong>Available:</strong> ${value.available || "false"}
                  </div>
              `;
        leftSection.appendChild(label);
        leftSection.innerHTML += sensorInfo;

        const rightSection = document.createElement("div");
        rightSection.style.textAlign = "left";
        rightSection.style.display = "flex";
        rightSection.style.alignItems = "center";
        rightSection.style.justifyContent = "center";
        rightSection.style.padding = "5px";

        if (value.available === true) {
          const fetchButton = document.createElement("button");
          fetchButton.textContent = "Select";
          fetchButton.style.padding = "5px 5px";
          fetchButton.style.fontSize = "18px";
          fetchButton.style.cursor = "pointer";
          fetchButton.style.marginTop = "5px";
          fetchButton.style.width = "120px";
          fetchButton.style.height = "40px";
          fetchButton.onclick = function () {
            selected_port = key;
            const sensorStatusBox = document.getElementById("sensorStatusBox");
            const statusBottomSection = document.getElementById("statusBottomSection");
            sensorStatusBox.style.display = "grid";
            statusBottomSection.style.display = "flex";
            alert(`Selected port: ${key}`);

            // Highlight the selected box
            const parentBox = fetchButton.closest(".sensor-box");
            document.querySelectorAll(".sensor-box").forEach(box => {
              box.style.border = "1px solid #ccc";
              box.style.borderWidth = "1px";
            });
            parentBox.style.border = "3px solid green";
            parentBox.style.borderWidth = "3px";
          };
          rightSection.appendChild(fetchButton);
        } else {
          const unavailableButton = document.createElement("button");
          unavailableButton.textContent = "Unavailable";
          unavailableButton.style.padding = "5px 5px";
          unavailableButton.style.fontSize = "18px";
          unavailableButton.style.marginTop = "5px";
          unavailableButton.style.backgroundColor = "gray";
          unavailableButton.style.color = "white";
          unavailableButton.style.border = "none";
          unavailableButton.style.cursor = "not-allowed";
          unavailableButton.style.width = "120px";
          unavailableButton.style.height = "40px";
          unavailableButton.disabled = true;
          rightSection.appendChild(unavailableButton);
        }

        sensorDiv.appendChild(leftSection);
        sensorDiv.appendChild(rightSection);
        sensorContainer.appendChild(sensorDiv);
      }
    } catch (error) {
      console.error("Error parsing or displaying data:", error);
    }
  });
}

window.onload = function () {
  get_measure_duration();
  setInterval(update_status, 1000);
};


// Define the sensor list
const sensor_list = [
  ...[...Array(8).keys()].map(k => `MQ${k + 2}`),
  "MQ135",
  "GM102B",
  "GM302B",
  "GM502B",
  "GM702B"
];

// Function to create sensor status boxes
function createSensorStatusBoxes() {
  const sensorStatusBox = document.getElementById("sensorStatusBox");
  sensorStatusBox.style.display = "none";
  sensorStatusBox.style.gridTemplateColumns = "repeat(auto-fit, minmax(100px, 1fr))";
  sensorStatusBox.style.gap = "10px";

  // Create a box for each sensor
  sensor_list.forEach(sensor => {
    const sensorBox = document.createElement("div");
    sensorBox.style.border = "1px solid #ccc";
    sensorBox.style.borderRadius = "5px";
    sensorBox.style.padding = "5px";
    sensorBox.style.textAlign = "center";
    sensorBox.style.backgroundColor = "#f9f9f9";

    const sensorName = document.createElement("div");
    sensorName.textContent = sensor;
    sensorName.style.fontWeight = "bold";
    sensorName.style.marginBottom = "5px";

    const sensorValue = document.createElement("div");
    sensorValue.id = `sensor-${sensor}`;
    sensorValue.textContent = "N/A";
    sensorValue.style.fontSize = "12px";
    sensorValue.style.color = "#333";

    sensorBox.appendChild(sensorName);
    sensorBox.appendChild(sensorValue);
    sensorStatusBox.appendChild(sensorBox);
  });

  // Bottom section with input and buttons
  const bottomSection = document.createElement("div");
  bottomSection.style.marginTop = "12px";
  bottomSection.style.display = "none";
  bottomSection.style.flexDirection = "column";
  bottomSection.style.alignItems = "center";
  bottomSection.style.gap = "6px";
  bottomSection.id = "statusBottomSection";

  // Input field for treatment name
  const treatmentInput = document.createElement("input");
  treatmentInput.type = "text";
  treatmentInput.placeholder = "Enter Treatment Name";
  treatmentInput.style.padding = "0px";
  treatmentInput.style.flex = "2";
  treatmentInput.style.height = "40px";
  treatmentInput.style.width = "360px";
  treatmentInput.style.fontSize = "18px";
  treatmentInput.id = "treatmentInput";
  bottomSection.appendChild(treatmentInput);

  // Submit treatment
  const submitTreatmentButton = document.createElement("button");
  submitTreatmentButton.textContent = "Confirm";
  submitTreatmentButton.style.backgroundColor = "green";
  submitTreatmentButton.style.color = "white";
  submitTreatmentButton.style.border = "none";
  submitTreatmentButton.style.borderRadius = "5px";
  submitTreatmentButton.style.cursor = "pointer";
  submitTreatmentButton.style.flex = "1";
  submitTreatmentButton.style.padding = "5px";
  submitTreatmentButton.style.height = "40px";
  submitTreatmentButton.style.width = "120px";
  submitTreatmentButton.style.fontSize = "18px";
  submitTreatmentButton.onclick = function () {
    const treatmentName = treatmentInput.value.trim();
    if (!treatmentName) {
      alert("Please enter a treatment name.");
      return;
    } else {
      treatment_name = treatmentName;
      document.getElementById("treatmentInput").style.display = "none";
      document.getElementById("submitTreatmentButton").style.display = "none";
      document.getElementById("controlAirButton").style.display = "block";
    }
    alert(`Measuring control air for treatment: ${treatmentName}`);
  };
  submitTreatmentButton.id = "submitTreatmentButton";
  bottomSection.appendChild(submitTreatmentButton);

  // Control air button
  const controlAirButton = document.createElement("button");
  controlAirButton.textContent = "START STEP1 (measure control air)";
  controlAirButton.style.backgroundColor = "green";
  controlAirButton.style.color = "white";
  controlAirButton.style.border = "none";
  controlAirButton.style.borderRadius = "5px";
  controlAirButton.style.cursor = "pointer";
  controlAirButton.style.flex = "1";
  controlAirButton.style.textAlign = "center";
  controlAirButton.style.padding = "5px";
  controlAirButton.style.height = "40px";
  controlAirButton.style.width = "360px";
  controlAirButton.style.fontSize = "18px";
  controlAirButton.onclick = function () {
    if (!treatment_name) {
      alert("Please enter a treatment name.");
      return;
    }
    eel.measure_control_air(selected_port);
    alert(`Measuring control air for treatment: ${treatment_name} through port ${selected_port}`);

    // Hide the Control Air button
    controlAirButton.style.display = "none";

    // Create a counter element
    const counterElement = document.createElement("div");
    counterElement.id = "countdownTimer";
    counterElement.style.fontSize = "18px";
    counterElement.style.fontWeight = "bold";
    counterElement.style.color = "red";
    counterElement.textContent = `${measure_duration} seconds remaining...`;
    bottomSection.appendChild(counterElement);

    // Countdown logic
    let countdown = measure_duration;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        counterElement.textContent = `${countdown} seconds remaining...`;
      } else {
        clearInterval(countdownInterval); // Stop the timer
        eel.calculate_control_slope(selected_port);
        counterElement.remove(); // Remove the countdown element

        // Show the Sample Air button
        document.getElementById("sampleAirButton").style.display = "block";
      }
    }, 1000);
  };
  controlAirButton.style.display = "none";
  controlAirButton.id = "controlAirButton";
  bottomSection.appendChild(controlAirButton);

  // Sample air button
  const sampleAirButton = document.createElement("button");
  sampleAirButton.textContent = "START STEP2 (measure sample air)";
  sampleAirButton.style.backgroundColor = "green";
  sampleAirButton.style.color = "white";
  sampleAirButton.style.border = "none";
  sampleAirButton.style.borderRadius = "5px";
  sampleAirButton.style.cursor = "pointer";
  sampleAirButton.style.flex = "1";
  sampleAirButton.style.textAlign = "center";
  sampleAirButton.style.padding = "5px";
  sampleAirButton.style.height = "40px";
  sampleAirButton.style.width = "360px";
  sampleAirButton.style.fontSize = "18px";

  sampleAirButton.onclick = function () {
    const treatmentName = treatmentInput.value.trim();
    if (!treatmentName) {
      alert("Please enter a treatment name.");
      return;
    }
    alert(`Measuring sample air for treatment: ${treatmentName}`);
    eel.measure_sample_air(selected_port);

    // Hide the Sample Air button
    sampleAirButton.style.display = "none";

    // Create a counter element
    const counterElement = document.createElement("div");
    counterElement.id = "countdownTimer";
    counterElement.style.fontSize = "18px";
    counterElement.style.fontWeight = "bold";
    counterElement.style.color = "red";
    counterElement.textContent = `${measure_duration} seconds remaining...`;
    bottomSection.appendChild(counterElement);

    // Countdown logic for measurement
    let countdown = measure_duration;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        counterElement.textContent = `${countdown} seconds remaining...`;
      } else {
        clearInterval(countdownInterval); // Stop the timer
        eel.calculate_sample_slope(selected_port, treatment_name); // Trigger backend logic

        // Start post-measurement wait logic
        let postCountdown = 300; // Post-measurement wait duration
        counterElement.textContent = `Please remove the sample, and wait for ${postCountdown} seconds...`;

        const postCountdownInterval = setInterval(() => {
          postCountdown--;
          if (postCountdown > 0) {
            counterElement.textContent = `Please remove the sample, and wait for ${postCountdown} seconds...`;
          } else {
            clearInterval(postCountdownInterval); // Stop the timer
            counterElement.remove(); // Remove the countdown element

            // Show the treatment input and submit button for new measurement
            document.getElementById("treatmentInput").style.display = "block";
            document.getElementById("submitTreatmentButton").style.display = "block";
          }
        }, 1000);
      }
    }, 1000);
  };
  sampleAirButton.style.display = "none";
  sampleAirButton.id = "sampleAirButton";
  bottomSection.appendChild(sampleAirButton);

  // Create a horizontal line
  const horizontalLine = document.createElement("hr");
  horizontalLine.style.margin = "12px 0";
  horizontalLine.style.border = "0";
  horizontalLine.style.borderTop = "1px solid #ccc";

  // Append the horizontal line and bottom section
  sensorStatusBox.parentElement.appendChild(horizontalLine);

  // Add bottom section
  sensorStatusBox.parentElement.appendChild(bottomSection);

}


// Function to update sensor readings dynamically
async function updateSensorReading(selected_port) {
  if (selected_port) {
    try {
      // Fetch readings asynchronously from eel
      const readings = await eel.get_current_readings(selected_port)();
      const logs = await eel.get_current_logs(selected_port)();

      // Parse the JSON data for readings
      const parsedData = JSON.parse(readings);

      // Update sensor readings
      sensor_list.forEach((sensor) => {
        const sensorElement = document.getElementById(`sensor-${sensor}`);
        if (sensorElement && parsedData[sensor] !== undefined) {
          sensorElement.textContent = parsedData[sensor]; // Update the reading using the sensor name as key
        } else if (sensorElement) {
          sensorElement.textContent = "N/A"; // Fallback if no reading is available
        }
      });

      // Append logs to the logContainer
      const logContainer = document.getElementById("logContainer");
      logContainer.innerHTML = ""; // Clear previous logs
      // Apply styling to the log container
      logContainer.style.backgroundColor = "#1e1e1e"; // Dark background
      logContainer.style.color = "#00ff00"; // Green text
      logContainer.style.lineHeight = "1.2"; // Reduce spacing between lines
      logContainer.style.padding = "10px"; // Add padding for readability
      logContainer.style.borderRadius = "5px"; // Add rounded corners for aesthetics
      logContainer.style.overflowY = "auto"; // Add scroll if content exceeds the container height
      logContainer.style.maxHeight = "300px"; // Set a maximum height for the log container
      if (Array.isArray(logs)) {
        logs.forEach((log) => {
          const logElement = document.createElement("p");
          logElement.textContent = log; // Set log content
          logContainer.appendChild(logElement);
        });
        // Scroll to the bottom to show the latest log
        logContainer.scrollTop = logContainer.scrollHeight;
      } else {
        console.error("Logs are not in the expected array format.");
      }

    } catch (error) {
      console.error("Error updating sensor readings:", error);
    }
  } else {
    console.error("No selected port provided.");
  }
}



// Initialize sensor status boxes
createSensorStatusBoxes();