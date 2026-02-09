from pathlib import Path
import os
from time import sleep

while True:
    os.system("scp pi@snorlax:/home/pi/test*.jpg ~/Desktop/captures")
    sleep(30)