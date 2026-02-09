from PIL import Image
import glob
import os
import sys

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

the_total_width = 0
max_height = 0

for img in images:
        the_total_width = the_total_width + img.size[0]
        if img.size[1] > max_height:
                max_height = img.size[1]

the_full_slide = Image.new("RGB", (the_total_width, max_height), "white")

x = 0
for img in images:
        the_full_slide.paste(img, (x,0))
        x = x + img.size[0]
        
the_full_slide.save("TheWhiteboardNotes.pdf")

# To run this, go on terminal and write ' python3 <the location of where you stored this python file>  <the location of the folder of jpg files that you want to convert into a single pdf> ', don't add <> in the command 
