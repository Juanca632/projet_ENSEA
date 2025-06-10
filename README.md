# 🏡 Home Automation System with Raspberry Pi, MQTT, and VPN-Connected VPS

This repository contains the complete application stack for a **modular home automation system** built using **React**, **FastAPI**, **Docker**, and **MQTT**. It is designed to run on **Raspberry Pi devices** that communicate securely through a **VPN** to a **centralized VPS**, which hosts the MQTT broker and enables remote access.

---

## 🔧 Features

- **Modular Architecture** — Easily add or remove Raspberry Pi nodes with minimal configuration.
- **Secure Communication** — All devices connect through a VPN to a central VPS.
- **Centralized MQTT Broker** — Hosted on the VPS for efficient message routing.
- **Remote Access via VPS** — Each Raspberry Pi runs its own local app accessible through reverse proxies or SSH tunnels.
- **Local Autonomy** — Each Raspberry Pi runs an independent frontend (React) and backend (FastAPI), enabling offline functionality.
- **Dockerized** — All components (frontend, backend, broker) run in Docker containers for ease of deployment.

---



