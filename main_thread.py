from threading import Thread, Event
import paho.mqtt.client as mqtt
import subprocess

TIMER = 1

class MainThread(Thread):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._stop_event = Event()
        self._event_timer = Event()
        self.lights_state = False
        self.last_light_value = None  # Store the last received value from /home/lights

        # Configure the MQTT client
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to broker MQTT!")
            # Subscribe only to the topic we're interested in
            self.client.subscribe("/home/lights")
        else:
            print(f"There's a connection error {rc}")

    def on_message(self, client, userdata, msg):
        # Print incoming message
        print(f"Message received: topic={msg.topic}, payload={msg.payload.decode()}")
        # If the topic is /home/lights, store its value
        if msg.topic == "/home/lights":
            try:
                self.last_light_value = int(msg.payload.decode())
            except ValueError:
                print("Invalid payload for lights")

    def run(self) -> None:
        # Connect to the MQTT broker and start listening
        self.client.connect("91.99.149.250", 1883, 60)
        self.client.loop_start()
        while not self._stop_event.is_set():
            try:
                # Wait with timeout in case we want to do timed work
                self._event_timer.wait(TIMER)
            except Exception as e:
                print(f"Exception message: {e}")
        return super().run()

    def toggleLightsState(self):
        print(f"Last value from /home/lights: {self.last_light_value}")

        if self.last_light_value is None:
            print("No value received yet from /home/lights.")
            return {"status": "no data"}

        if self.last_light_value == 0:
            print("Running: gpioset gpiochip0 4=1")
            subprocess.run(["gpioset", "gpiochip0", "4=1"])
            print("Lights: 1")
            
            # Publish updated value to MQTT with retain flag
            self.client.publish("/home/lights", payload="1", retain=True)
            self.last_light_value = 1  # Update internal value
            return {"gpio": 1}
        
        else:
            print("Running: gpioset gpiochip0 4=0")
            subprocess.run(["gpioset", "gpiochip0", "4=0"])
            print("Lights: 0")
            
            # Publish updated value to MQTT with retain flag
            self.client.publish("/home/lights", payload="0", retain=True)
            self.last_light_value = 0  # Update internal value
            return {"gpio": 0}


    def stop_thread(self):
        """Signal the thread to stop."""
        self._stop_event.set()
