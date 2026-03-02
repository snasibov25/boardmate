import os
import PIL.Image as Image
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
IMAGES_PATH = BASE_DIR / "Image"
PDF_DIR = BASE_DIR / "SavedPDF"
PDF_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_SAVE_PATH = PDF_DIR / "output.pdf"     

IMAGES_FORMAT = ['.jpg']          
IMAGE_SIZE = 256                         
IMAGE_COLUMN = 3                          


image_names = sorted([
    name for name in os.listdir(IMAGES_PATH)])

IMAGE_ROW_remainder = len(image_names) % IMAGE_COLUMN
if IMAGE_ROW_remainder == 0:
    IMAGE_ROW = len(image_names) // IMAGE_COLUMN
else:
    IMAGE_ROW = len(image_names) // IMAGE_COLUMN + 1


def image_compose():
    to_image = Image.new('RGB', (IMAGE_COLUMN * IMAGE_SIZE, IMAGE_ROW * IMAGE_SIZE))

    total_num = 0
    for y in range(1, IMAGE_ROW + 1):
        for x in range(1, IMAGE_COLUMN + 1):

            if total_num == len(image_names):  
                return to_image.save(IMAGE_SAVE_PATH)

            img_path = os.path.join(IMAGES_PATH, image_names[total_num]) 
            from_image = Image.open(img_path).rotate(270,expand=True).resize((IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.LANCZOS)

            to_image.paste(from_image, ((x - 1) * IMAGE_SIZE, (y - 1) * IMAGE_SIZE))
            total_num += 1

    return to_image.save(IMAGE_SAVE_PATH)

image_compose()
print("done")
