from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image
import os

IMAGE_DIR = "~/Desktop/captures"       
OUTPUT_PDF = "output.pdf"   
COLS = 3                    
MARGIN = 50                 
page_w, page_h = A4
c = canvas.Canvas(OUTPUT_PDF, pagesize=A4)


images = sorted([
    f for f in os.listdir(IMAGE_DIR)])

rows = (len(images) + COLS - 1) // COLS

cell_w = (page_w - 2 * MARGIN) / COLS
cell_h = (page_h - 2 * MARGIN) / rows

for i, name in enumerate(images):
    row = i // COLS
    col = i % COLS

    x = MARGIN + col * cell_
    y = page_h - MARGIN - (row + 1) * cell_h

    img_path = os.path.join(IMAGE_DIR, name)
    img = Image.open(img_path)
    w, h = img.size

    scale = min(cell_w / w, cell_h / h)
    draw_w = w * scale
    draw_h = h * scale

    c.drawImage(
        img_path,
        x + (cell_w - draw_w) / 2,
        y + (cell_h - draw_h) / 2,
        draw_w,
        draw_h
    )

c.save()
print("done")
