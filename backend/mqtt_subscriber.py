import os
import json
import time
import threading
import paho.mqtt.client as mqtt
from db import init_db, insert_vital

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = "vitals/#"

init_db()


def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT", rc)
    client.subscribe(TOPIC)


def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        insert_vital(data)
    except Exception as e:
        print("Failed to handle message:", e)


if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
