from PIL import Image
import glob
import os
import sys
import cv2

if len(sys.argv) != 2:
        print("Incorrect input")
        sys.exit(1)

theFolder = sys.argv[1]

the_jpg_files = glob.glob(os.path.join(theFolder, "*.jpg"))

if not the_jpg_files:
	raise FileNotFoundError("No jpg files have been found")

the_jpg_files = sorted(the_jpg_files, key=os.path.getmtime)

images = []

for thejpg in the_jpg_files:
        with Image.open(thejpg) as image:
                images.append(image.convert("RGB"))

opencv_images = []

for the_jpg in the_jpg_files:
        img = cv2.imread(thejpg)
        if img is None:
                print("Can't read")
                sys.exit(1)
        opencv_images.append(img)
        

the_stitcher = cv2.Stitcher_create()
status, stitched = the_stitcher.stitch(opencv_images)

if status != cv2.Stitcher_OK:
        sys.exit(1)

stitched_rgb = cv2.cvtColor(stitched, cv2.COLOR_BGR2RGB)
the_full_slide = Image.fromarray(stitched_rgb)
        
the_full_slide.save("TheWhiteboardNotes.pdf")

# To run this, go on terminal and write ' python3 <the location of where you stored this python file>  <the location of the folder of jpg files that you want to convert into a single pdf> ', don't add <> in the command 
