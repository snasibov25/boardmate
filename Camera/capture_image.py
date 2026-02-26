from pathlib import Path
import os
from time import sleep

for i in range(5):
    os.system("scp pi@snorlax:/home/pi/test{0}.jpg ~/Desktop/captures".format(i))
    sleep(1)
    if i >= 5:
        break
