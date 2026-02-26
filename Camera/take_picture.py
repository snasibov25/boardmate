## libcamera-still -nopreview -o test.jpg                       (insturction for taking picture)
## gpicview test_().jpg                                         (show pic)
## scp pi@(raspberry's name):/home/pi/test_().jpg ~/Desktop/    (copying image to desktop on DICE)

import os
from time import sleep

for i in range(5):
    sleep(1)
    os.system(f"ssh -XC pi@snorlax 'libcamera-still --nopreview -o test{i}.jpg'")
    
    
    