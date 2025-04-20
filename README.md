
# Proximity sensor with ESP32, Flask API and Desktop widget

Proximity sensor stack that contains the following functions : 
- ESP32 + IR Sensor to fetch the information and send it to web server via API rest
- Flask server that receives and stocks the informations sent by the ESP32
- Desktop widget that display the status of the sensor by calling the API.

This project is a cross-platform desktop application that shows the occupancy status of a room in real-time using an **ESP32 with an IR proximity sensor**.  
The desktop app displays the status in the system tray and can notify the user when the room becomes available.

---
## 🛰️ How It Works

- The **ESP32** detects if a door is open or closed using an IR sensor.
- The ESP32 sends the status (`OK` = occupied / `NONE` = free) to a **Flask API server** via HTTP POST. 
- The Flask API Server also comes with a static index HTML page that displays the status in real time. 
- The Electron app periodically polls the API to update the tray icon and display the room status.
- The desktop app has the following features :
  - Get notified when the room becomes free
  - Open the web status page
  - Change the API server IP address

---


# SETUP

## 🛠️ Technologies Used

- **Electron** (Node.js + Chromium)
- **Flask** (for API backend)
- **ESP32** (Arduino + IR sensor)
- **Electron Store** (to persist IP config)
- **Electron Builder** (for packaging)

---

## ESP32 and IR Sensor

[cabling scheme]

For this part, I used an ESP32 Devkit 30 pins. Just cable everything together and flash the code with Arduino IDE. 

The variables to edit are : 
 
- SSID
- Password
- serverUrl

---

## Flask API server

Create a Python venv with the following libraries with pip :
```
pip install flask flask-cors
```
Then paste the **app.py** and **static** folder in the venv. 

And start the server with :
```
python3 app.py
```
You can start the venv and app.py in a Tmux session if you want it to run in background.

---

## Electron Widget app

If you want to use the generic packaged app, just download you OS release and install it :
- .exe installer for Windows
- AppImage or .deb package for Linux
- .dmg installer for MacOS
---
If you want to customize the Widget app, install **NodeJS** on your computer and download the "Electron widget app" source files from the repo. 

Then on your terminal go into the electron_widget_app folder and type : 
```
npm install
```
You should then be able to run it in dev mode with :
```
npm start
```

You can then rebuild it from the sources for any platform you want :
```
npm build:win/linux/mac
```

If you need further help to customize it, you can contact me directly :)


