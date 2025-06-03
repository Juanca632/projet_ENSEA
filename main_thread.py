from threading import Thread, Event
import paho.mqtt.client as mqtt
import subprocess

TIMER = 1

class MainThread(Thread):

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._stop_event = Event()
        self._event_timer = Event()

        # Store the state of all devices
        self.states = {
            "home/living_room/lights": None,
            "home/kitchen/lights": None,
            "home/living_room/air_conditioning": None
        }

        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to broker MQTT!")
            for topic in self.states:
                self.client.subscribe(topic)
        else:
            print(f"Connection error: {rc}")

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode()
        print(f"Message received: topic={topic}, payload={payload}")
        try:
            self.states[topic] = int(payload)
        except (ValueError, KeyError):
            print(f"Ignored invalid message: {topic} -> {payload}")

    def run(self) -> None:
        self.client.connect("91.99.149.250", 1883, 60)
        self.client.loop_start()
        while not self._stop_event.is_set():
            self._event_timer.wait(TIMER)

    def stop_thread(self):
        self._stop_event.set()

    def get_all_states(self):
        """Return current state of all monitored topics as JSON."""
        return {
            "living_room_lights": self.states["home/living_room/lights"],
            "kitchen_lights": self.states["home/kitchen/lights"],
            "air_conditioning": self.states["home/living_room/air_conditioning"],
        }

    def set_device_state(self, topic: str, value: int):
        """Set device state via GPIO and update MQTT retained value."""
        if topic not in self.states:
            return {"error": f"Unknown topic: {topic}"}

        gpio_map = {
            "home/living_room/lights": 4,
            "home/kitchen/lights": 5,
            "home/living_room/air_conditioning": 6
        }

        gpio_pin = gpio_map.get(topic)
        if gpio_pin is None:
            return {"error": "GPIO not configured for this topic"}

        # Update GPIO (mockable)
        cmd = f"gpioset gpiochip0 {gpio_pin}={value}"
        print(f"Running: {cmd}")
        # subprocess.run(["gpioset", "gpiochip0", f"{gpio_pin}={value}"])

        # Update MQTT
        self.client.publish(topic, payload=str(value), retain=True)
        self.states[topic] = value
        return {"topic": topic, "gpio": value}
