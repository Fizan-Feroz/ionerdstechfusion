/*
  Placeholder ESP32 + MAX30105 publisher sketch.
  Requires: MAX30105 library, PubSubClient, WiFi credentials set below.
*/

#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASS";
const char* mqtt_server = "192.168.1.10"; // change to your broker

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("esp32-client")) {
      // connected
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  // Read sensor here and publish JSON like:
  // {"patient_id":"P1","timestamp":1234567,"hr":72,"spo2":98}
  String payload = "{\"patient_id\":\"P1\",\"timestamp\":1234567,\"hr\":72,\"spo2\":98}";
  client.publish("vitals/P1", payload.c_str());
  delay(200);
}
