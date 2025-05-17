import sys
import os
import requests
from io import BytesIO

libdir = os.path.join(os.path.dirname(__file__), 'lib')
if os.path.exists(libdir):
    sys.path.append(libdir)

import logging
from waveshare_epd import epd7in5_V2
import time
from PIL import Image,ImageDraw,ImageFont
import traceback
import os

logging.basicConfig(level=logging.DEBUG)

def full_clear(epd):
    logging.info("clearing screen")
    epd.Clear()

def get_img(server_url):
    image_url = f"{server_url}/today-image"
    logging.info("downloading image from %s", image_url)

    response = requests.get(image_url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        logging.info("Downloaded image size = %s", image.size)
        return image
    else:
        logging.warning("Image for today not found on server, using default.jpg")
        image = Image.open('default.jpg')
        return image

try:
    server_url = os.getenv("SERVER_URL")
    if not server_url:
        logging.error("Environment variable 'server_url' not set")
        raise RuntimeError("Environment variable 'server_url' not set")
    logging.info(f"starting with server_url: {server_url}")

    # init screen
    logging.info("init screen")
    epd = epd7in5_V2.EPD()
    epd.init()
    full_clear(epd)

    # display image
    image = get_img(server_url)
    epd.display(epd.getbuffer(image))

    # enter sleep
    logging.info("sleep...")
    epd.sleep()

except IOError as e:
    logging.info(e)

except KeyboardInterrupt:
    logging.info("ctrl + c:")
    epd7in5_V2.epdconfig.module_exit(cleanup=True)
    exit()
