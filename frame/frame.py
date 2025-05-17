import sys
import os
import requests
from io import BytesIO
import logging
import time
from PIL import Image

libdir = os.path.join(os.path.dirname(__file__), 'lib')
if os.path.exists(libdir):
    sys.path.append(libdir)
from waveshare_epd import epd7in5_V2

logging.basicConfig(level=logging.INFO)

def full_clear(epd):
    logging.info("clearing screen")
    epd.Clear()

def get_img(server_url):
    image_url = f"{server_url}/today-image"
    logging.info("downloading image from %s", image_url)

    response = requests.get(image_url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        logging.info("downloaded image size = %s", image.size)
        return image
    else:
        logging.warning("image for today not found on server, using default.jpg")
        image = Image.open('default.jpg')
        return image

def main():
    server_url = os.getenv("SERVER_URL")
    if not server_url:
        logging.error("environment variable 'server_url' not set")
        raise RuntimeError("environment variable 'server_url' not set")
    logging.info("starting with server_url: %s", server_url)


    try:
        while True:
            # check if it's midnight
            hour_of_the_day = time.localtime().tm_hour
            if hour_of_the_day != 0:
                logging.info(f"not midnight ({hour_of_the_day}), waiting for next hour")
                time.sleep(3600)
                continue

            # init screen
            logging.info("init screen")
            epd = epd7in5_V2.EPD()
            epd.init()

            # get current image
            image = get_img(server_url)

            # clear screen
            full_clear(epd)

            # display image
            epd.display(epd.getbuffer(image))

            # send screen to sleep
            logging.info("send screen to sleep")
            epd.sleep()

            # wait for next hour
            time.sleep(3600)

    except IOError as e:
        logging.info(e)

    except KeyboardInterrupt:
        logging.info("ctrl + c:")
        epd7in5_V2.epdconfig.module_exit(cleanup=True)
        exit()

if __name__ == "__main__":
    main()
