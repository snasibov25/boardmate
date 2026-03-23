import cv2
import numpy as np
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
IMAGES_PATH = BASE_DIR / "Image"
PDF_DIR = BASE_DIR / "SavedPDF"
PDF_DIR.mkdir(exist_ok=True)

COLS = 6
ROWS = 4
SCALE = 1.15

def crop_tile(img):
    h, w = img.shape[:2]
    return img[int(h*0.05):int(h*0.95), int(w*0.05):int(w*0.95)]

def blend_horizontal(img1, img2, overlap):
    h = img1.shape[0]
    x = np.linspace(0, np.pi, overlap)
    alpha = (1 - np.cos(x)) / 2
    alpha = alpha.reshape(1, overlap, 1)

    left = img1[:, -overlap:].astype(np.float32)
    right = img2[:, :overlap].astype(np.float32)

    blend = (1 - alpha) * left + alpha * right
    blend = cv2.GaussianBlur(blend, (5, 5), 0)

    return np.hstack([
        img1[:, :-overlap],
        blend.astype(np.uint8),
        img2[:, overlap:]
    ])

def blend_vertical(img1, img2, overlap):
    w = img1.shape[1]
    x = np.linspace(0, np.pi, overlap)
    alpha = (1 - np.cos(x)) / 2
    alpha = alpha.reshape(overlap, 1, 1)

    top = img1[-overlap:, :].astype(np.float32)
    bottom = img2[:overlap, :].astype(np.float32)

    blend = (1 - alpha) * top + alpha * bottom
    blend = cv2.GaussianBlur(blend, (5, 5), 0)

    return np.vstack([
        img1[:-overlap, :],
        blend.astype(np.uint8),
        img2[overlap:, :]
    ])

images = []

for i in range(ROWS * COLS):
    path = IMAGES_PATH / f"img_{i:03d}.jpg"
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError(f"Missing image: {path}")
    img = crop_tile(img)
    images.append(img)

sample_h, sample_w = images[0].shape[:2]
OVERLAP_X = int(sample_w * 0.12)
OVERLAP_Y = int(sample_h * 0.12)

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