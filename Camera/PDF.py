import os
import PIL.Image as Image

IMAGES_PATH = "/afs/inf.ed.ac.uk/user/s25/s2563745/Desktop/captures"         
IMAGES_FORMAT = ['.jpg']          
IMAGE_SIZE = 256                         
IMAGE_COLUMN = 5                          
IMAGE_SAVE_PATH = "/afs/inf.ed.ac.uk/user/s25/s2563745/Desktop/output.pdf"  

image_names = sorted([
    name for name in os.listdir(IMAGES_PATH)
    for item in IMAGES_FORMAT
    if os.path.splitext(name)[1] == item
])

IMAGE_ROW_yu = len(image_names) % IMAGE_COLUMN
if IMAGE_ROW_yu == 0:
    IMAGE_ROW = len(image_names) // IMAGE_COLUMN
else:
    IMAGE_ROW = len(image_names) // IMAGE_COLUMN + 1

print("image_names", image_names)


def image_compose():
    to_image = Image.new('RGB', (IMAGE_COLUMN * IMAGE_SIZE, IMAGE_ROW * IMAGE_SIZE))

    total_num = 0
    for y in range(1, IMAGE_ROW + 1):
        for x in range(1, IMAGE_COLUMN + 1):

            if total_num == len(image_names):  
                return to_image.save(IMAGE_SAVE_PATH)

            img_path = os.path.join(IMAGES_PATH, image_names[total_num]) 
            from_image = Image.open(img_path).resize((IMAGE_SIZE, IMAGE_SIZE), Image.ANTIALIAS)

            to_image.paste(from_image, ((x - 1) * IMAGE_SIZE, (y - 1) * IMAGE_SIZE))
            total_num += 1

    return to_image.save(IMAGE_SAVE_PATH)

image_compose()
print("done")
