# 🖌️ inkday

<img src="/img/front.jpg" width="600" />

A 3D printable frame for a 7.5" e-ink display and a website to control its content.

Upload images via the website's calendar interface. Choose one image for each day.

👉 **[Website Demo](https://inkday.jflessau.com)**

## 📦 Hardware Requirements

- 7.5" WaveShare e-ink display
- Raspberry Pi 3B+ with power supply and WiFi connection
- 3D printer
- A server for the website
- Four screws to attach the Pi to the frame (head diameter: 5mm, thread diameter: 3mm, length: 5mm)

## 🖐️ Usage

### 1. Run the Server

Start the server with Docker and mount a directory to store the images in:

```bash
docker run -d -p 80:1313 -v /your-inkday-data:/data ghcr.io/jflessau/inkday:latest
```

Images will be resized to fit the frame (`800x480 px`).

### 2. Connect Pi & Server

Create a new directory on your Pi and put `./frame/frame.py` and `./frame/default.jpg` into it.  
Download this repo and put its `RaspberryPi_JetsonNano/python/lib` directory and all its contents next to `frame.py` and `default.jpg`.

Now set the environment variable `SERVER_URL` to the URL of the server (e.g., `http://localhost:80`) and run `python3 frame.py`.

Your Pi should fetch images from the server and display them on the e-ink display.

If there is no image for the current day, the default image will be displayed.

### 3. Print the Frame

Print `./frame/inkday-frame.stl` (only one piece; supports are optional).

### 4. Assemble the Frame

1. Slide the screen into the frame with its cable pointing down.
2. Connect the screen's cable to the driver.
3. Connect the driver to the Pi.
4. Attach the Pi with 4 screws.
5. Connect the Pi to a power source.

<details>
<summary><b>The result should look like this (click to expand)</b></summary>
<img src="/img/back.jpg" max-width="800px"/>
</details>
