#include <Multichannel_Gas_GMXXX.h>
#include <Wire.h>
GAS_GMXXX<TwoWire> gas;

void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  gas.begin(Wire, 0x08); // use the hardware I2C
}

void loop() {
  int sensorValueMQ2 = analogRead(13);
  int sensorValueMQ3 = analogRead(14);
  int sensorValueMQ4 = analogRead(27);
  int sensorValueMQ5 = analogRead(26);
  int sensorValueMQ6 = analogRead(25);
  int sensorValueMQ7 = analogRead(33);
  int sensorValueMQ8 = analogRead(32);
  int sensorValueMQ9 = analogRead(35);
  int sensorValueMQ135 = analogRead(34);
  int GM102B = gas.getGM102B();
  int GM302B = gas.getGM302B();
  int GM502B = gas.getGM502B();
  int GM702B = gas.getGM702B();
  if (GM102B > 999) GM102B = 999;
  if (GM302B > 999) GM302B = 999;
  if (GM502B > 999) GM502B = 999;
  if (GM702B > 999) GM702B = 999;

  // print out the value you read:
  Serial.print(sensorValueMQ2);
  Serial.print(",");
  Serial.print(sensorValueMQ3);
  Serial.print(",");
  Serial.print(sensorValueMQ4);
  Serial.print(",");
  Serial.print(sensorValueMQ5);
  Serial.print(",");
  Serial.print(sensorValueMQ6);
  Serial.print(",");
  Serial.print(sensorValueMQ7);
  Serial.print(",");
  Serial.print(sensorValueMQ8);
  Serial.print(",");
  Serial.print(sensorValueMQ9);
  Serial.print(",");
  Serial.print(sensorValueMQ135);
  Serial.print(",");
  Serial.print(GM102B);
  Serial.print(",");
  Serial.print(GM302B);
  Serial.print(",");
  Serial.print(GM502B);
  Serial.print(",");
  Serial.println(GM702B);

  delay(1000); // delay in between reads for stability
}
