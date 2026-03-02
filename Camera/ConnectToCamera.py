## libcamera-still -nopreview -o test.jpg                       (insturction for taking picture)
## gpicview test_().jpg                                         (show pic)
## scp pi@(raspberry's name):/home/pi/test_().jpg ~/Desktop/    (copying image to desktop on DICE)

import os
from time import sleep

#for i in range(5):
#    os.system(f"ssh -XC pi@snorlax 'libcamera-still --nopreview -o test{i}.jpg'")

#os.system("ssh pi@snorlax 'for i in {0..5}; do libcamera-still --nopreview --timeout 0 -o test$i.jpg; done'")

os.system(
    "ssh pi@snorlax "
    "'sudo killall libcamera-still libcamera-vid 2>/dev/null; "
    "libcamera-still --nopreview -t 14000 --timelapse 2000 -o test%01d.jpg'"
)

