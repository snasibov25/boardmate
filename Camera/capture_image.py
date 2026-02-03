from pathlib import Path
import os
import time

while True:
    os.system("scp pi@snorlax:/home/pi/test*.jpg ~/Desktop/captures")