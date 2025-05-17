# 🖌️ inkday

<img alt="A cute robot holding and looking at a piece of paper with a recipe on it." src="inkday-icon.png" width="180px"/>

A 3D printable frame for the [7.5" WaveShare e-ink display](https://www.waveshare.com/7.5inch-e-paper-hat.htm) and a website to control its content.

The website lets user upload an image for every day via a calendar interface.
The image is then displayed on the e-ink display for that day.

## 📦 Hardware Requirements

- [7.5" WaveShare e-ink display](https://www.waveshare.com/7.5inch-e-paper-hat.htm)
- Raspberry Pi 3B+ with power supply and WiFi connection
- 3D printer (you can also use an online service to print the frame)
- A server for the website (which can be the Pi itself)

## 🖐️ Usage

### 1. Printing the Frame

The frame (`./frame/inkday-frame.stl`) is designed to be printed in one piece, supports are optional.

### 2. Assembling the Frame

TODO

### 3. Host the Server

Either build the docker image yourself with `cd web && docker build -t inkday .`
or pull it from ghcr.io with `docker pull TODO`.
Then run the container:

```bash
docker run -d -p 80:1313 -v /path/to/inkday:/data inkday
```

This will start the website on port 80 and mount the `/path/to/inkday` directory to the container's `/data` directory, where the images are stored.

### 4. Connect the E-ink Display with the Server

Put `./frame/frame.py` on your Pi, set the environment variable `SERVER_URL` to the URL of the server (e.g. `http://localhost:80`), and run it with `python3 frame.py`.

## 🖥️ Development

### Web

The webserver is written with [node.js](https://nodejs.org/en/) and [express](https://expressjs.com/).
To run it locally, install the dependencies with `npm install` and start the server with `npm start`.

### E-ink Display

The e-ink display is controlled with a python script. It calls the server every 10 minutes to check for new images and displays the daily image.
To properly test it, you'll need to run it on a Raspberry Pi with the e-ink display connected (see above).
