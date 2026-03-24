import cv2
import numpy as np
from pathlib import Path
from PIL import Image
import glob
import os

BASE_DIR = Path(__file__).resolve().parent
IMAGES_PATH = BASE_DIR / "Image"
PDF_DIR = BASE_DIR / "SavedPDF"
PDF_DIR.mkdir(exist_ok=True)

COLS = 6
SCALE = 1.15

def crop_tile(img):
    h, w = img.shape[:2]
    # 🔽 LESS ZOOM (was 0.05 → now 0.02)
    return img[int(h*0.02):int(h*0.98), int(w*0.02):int(w*0.98)]

def blend_horizontal(img1, img2, overlap):
    h = min(img1.shape[0], img2.shape[0])
    img1 = img1[:h, :]
    img2 = img2[:h, :]

    left = img1[:, -overlap:].astype(np.float32)
    right = img2[:, :overlap].astype(np.float32)

    g1 = cv2.cvtColor(left.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(right.astype(np.uint8), cv2.COLOR_BGR2GRAY)

    grad1 = cv2.Sobel(g1, cv2.CV_32F, 1, 0, ksize=3)
    grad2 = cv2.Sobel(g2, cv2.CV_32F, 1, 0, ksize=3)

    grad_diff = np.abs(grad1) - np.abs(grad2)
    alpha = 1 / (1 + np.exp(-grad_diff / 10.0))
    alpha = alpha.reshape(h, overlap, 1)

    blend = alpha * left + (1 - alpha) * right

    return np.hstack([
        img1[:, :-overlap],
        blend.astype(np.uint8),
        img2[:, overlap:]
    ])

def blend_vertical(img1, img2, overlap):
    w = min(img1.shape[1], img2.shape[1])
    img1 = img1[:, :w]
    img2 = img2[:, :w]

    top = img1[-overlap:, :].astype(np.float32)
    bottom = img2[:overlap, :].astype(np.float32)

    g1 = cv2.cvtColor(top.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(bottom.astype(np.uint8), cv2.COLOR_BGR2GRAY)

    grad1 = cv2.Sobel(g1, cv2.CV_32F, 0, 1, ksize=3)
    grad2 = cv2.Sobel(g2, cv2.CV_32F, 0, 1, ksize=3)

    grad_diff = np.abs(grad1) - np.abs(grad2)
    alpha = 1 / (1 + np.exp(-grad_diff / 10.0))
    alpha = alpha.reshape(overlap, w, 1)

    blend = alpha * top + (1 - alpha) * bottom

    return np.vstack([
        img1[:-overlap, :],
        blend.astype(np.uint8),
        img2[overlap:, :]
    ])

image_paths = sorted(glob.glob(os.path.join(IMAGES_PATH, "*.jpg")) + 
                     glob.glob(os.path.join(IMAGES_PATH, "*.jpeg")))

if len(image_paths) == 0:
    raise ValueError("No images found in Imagez folder")

images = []
for path in image_paths:
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError(f"Failed to load: {path}")

    # 🔁 ROTATE 90° CLOCKWISE
    img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

    img = crop_tile(img)
    images.append(img)

total = len(images)
ROWS = total // COLS

if ROWS == 0:
    raise ValueError("Not enough images to form even one row")

if total % COLS != 0:
    print(f"Warning: ignoring {total % COLS} extra images")

images = images[:ROWS * COLS]

sample_h, sample_w = images[0].shape[:2]
OVERLAP_X = int(sample_w * 0.10)
OVERLAP_Y = int(sample_h * 0.10)

rows = []
idx = 0

for row in range(ROWS):
    row_imgs = images[idx:idx + COLS]
    if row % 2 == 1:
        row_imgs = row_imgs[::-1]

    stitched_row = row_imgs[0]

    for i in range(1, COLS):
        stitched_row = blend_horizontal(stitched_row, row_imgs[i], OVERLAP_X)

    rows.append(stitched_row)
    idx += COLS

canvas = rows[0]

for i in range(1, ROWS):
    canvas = blend_vertical(canvas, rows[i], OVERLAP_Y)

new_w = int(canvas.shape[1] * SCALE)
new_h = int(canvas.shape[0] * SCALE)

canvas = cv2.resize(canvas, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

canvas_rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)

Image.fromarray(canvas_rgb).save(
    PDF_DIR / "Final.pdf",
    "PDF",
    resolution=300
)

print("Done.")