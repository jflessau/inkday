# 🖌️ inkday

A 3D printable frame for a 7.5" e-ink display and a website to control its content.

Upload images via the website's calendar interface. Choose one image for each day.

## 📦 Hardware Requirements

- 7.5" WaveShare e-ink display
- Raspberry Pi 3B+ with power supply and WiFi connection
- 3D printer
- A server for the website

## 🖐️ Usage

### 1. Run the Server

Start the server with docker and mount a directory to store the images in:

```bash
docker run -d -p 80:1313 -v /your-inkday-data:/data ghcr.io/jflessau/inkday:latest
```

Images will be resized to fit the frame (`800x480 px`).

### 2. Connect Pi & Server

Create a new directory on your Pi and put `./frame/frame.py` and `./frame/default.jpg` into it.  
Set the environment variable `SERVER_URL` to the URL of the server (e.g. `http://localhost:80`), then run `python3 frame.py`.

Now your Pi should fetch the images from the server and display them on the e-ink display.

If there is no image for the current day, the frame will display a default image.

### 3. Printing the Frame

Print `./frame/inkday-frame.stl` (just one piece, supports are optional)

### 4. Assembling the Frame

TODO
