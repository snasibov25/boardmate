from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import time
import subprocess
import zipfile

import cv2
from PIL import Image
from adafruit_servokit import ServoKit

HOST = "0.0.0.0"
PORT = 8080

# ---------------- Actuator config ----------------
ACTUATOR_MODE = "servo"

# PCA9685 I2C address (usually 0x40)
PCA9685_ADDRESS = 0x7F
PCA9685_CHANNELS = 16

# Driver board ports:
# P1 -> channel 0
# P2 -> channel 1
PEN_CHANNEL = 0
ERASER_CHANNEL = 1

# Tune these for your mechanism
PEN_UP_ANGLE = 45
PEN_DOWN_ANGLE = 90
ERASER_UP_ANGLE = 32
ERASER_DOWN_ANGLE = 72

PEN_INVERT = False
ERASER_INVERT = False

GRID_ROWS = 4
GRID_COLS = 6

BASE_DIR = "/home/pi/scans"
CAPTURE_WIDTH = 1280
CAPTURE_HEIGHT = 720

CURRENT_SESSION = {
    "dir": None,
    "images": [],
    "pdf_path": None,
    "zip_path": None,
}

os.makedirs(BASE_DIR, exist_ok=True)

kit = None


def init_actuators():
    global kit
    if ACTUATOR_MODE == "servo":
        kit = ServoKit(channels=PCA9685_CHANNELS, address=PCA9685_ADDRESS)

        # Typical servo pulse range; adjust if needed
        kit.servo[PEN_CHANNEL].set_pulse_width_range(500, 2500)
        kit.servo[ERASER_CHANNEL].set_pulse_width_range(500, 2500)

        time.sleep(0.3)
        set_pen_up()
        set_eraser_up()


def _apply_servo_angle(channel, angle, invert=False):
    if invert:
        angle = 180 - angle
    angle = max(0, min(180, angle))
    kit.servo[channel].angle = angle
    time.sleep(0.4)


def set_pen_up():
    _apply_servo_angle(PEN_CHANNEL, PEN_UP_ANGLE, PEN_INVERT)


def set_pen_down():
    _apply_servo_angle(PEN_CHANNEL, PEN_DOWN_ANGLE, PEN_INVERT)


def set_eraser_up():
    _apply_servo_angle(ERASER_CHANNEL, ERASER_UP_ANGLE, ERASER_INVERT)


def set_eraser_down():
    _apply_servo_angle(ERASER_CHANNEL, ERASER_DOWN_ANGLE, ERASER_INVERT)


def new_scan_session():
    ts = time.strftime("%Y%m%d_%H%M%S")
    session_dir = os.path.join(BASE_DIR, f"scan_{ts}")
    os.makedirs(session_dir, exist_ok=True)

    CURRENT_SESSION["dir"] = session_dir
    CURRENT_SESSION["images"] = []
    CURRENT_SESSION["pdf_path"] = None
    CURRENT_SESSION["zip_path"] = None
    return session_dir


def capture_image(index=None):
    if CURRENT_SESSION["dir"] is None:
        new_scan_session()

    if index is None:
        index = len(CURRENT_SESSION["images"])

    filename = f"img_{index:03d}.jpg"
    path = os.path.join(CURRENT_SESSION["dir"], filename)

    cmd = [
        "libcamera-still",
        "-n",
        "-o", path,
        "--width", str(CAPTURE_WIDTH),
        "--height", str(CAPTURE_HEIGHT),
        "--immediate",
        "--denoise", "off",
        "--gain", "1",
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)

    CURRENT_SESSION["images"].append(path)
    return path

def make_raw_zip():
    if not CURRENT_SESSION["images"]:
        raise RuntimeError("No images captured")

    zip_path = os.path.join(CURRENT_SESSION["dir"], "raw_images.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for img_path in CURRENT_SESSION["images"]:
            zf.write(img_path, arcname=os.path.basename(img_path))

    CURRENT_SESSION["zip_path"] = zip_path
    return zip_path

class Handler(BaseHTTPRequestHandler):
    def send_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path, content_type, download_name=None):
        if not os.path.exists(path):
            self.send_json(404, {"ok": False, "error": "file_not_found"})
            return

        with open(path, "rb") as f:
            data = f.read()

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if download_name:
            self.send_header("Content-Disposition", f'attachment; filename=\"{download_name}\"')
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_GET(self):
        if self.path == "/ready":
            self.send_json(200, {
                "ok": True,
                "status": "ready",
                "mode": ACTUATOR_MODE,
                "session_dir": CURRENT_SESSION["dir"],
            })
            return

        if self.path == "/download/pdf":
            if CURRENT_SESSION["pdf_path"] is None:
                self.send_json(404, {"ok": False, "error": "pdf_not_ready"})
                return
            self.send_file(CURRENT_SESSION["pdf_path"], "application/pdf", "scan.pdf")
            return

        if self.path == "/download/raw":
            if CURRENT_SESSION["zip_path"] is None:
                self.send_json(404, {"ok": False, "error": "zip_not_ready"})
                return
            self.send_file(CURRENT_SESSION["zip_path"], "application/zip", "raw_images.zip")
            return

        self.send_json(404, {"ok": False, "error": "not_found"})

    def do_POST(self):
        try:
            if self.path == "/scan/prepare":
                session_dir = new_scan_session()
                self.send_json(200, {"ok": True, "session_dir": session_dir})
                return

            if self.path == "/scan/capture":
                data = self.read_json()
                index = data.get("index")
                img_path = capture_image(index=index)
                self.send_json(200, {"ok": True, "image": img_path})
                return

            if self.path == "/scan/finalize":
                zip_path = make_raw_zip()
                self.send_json(200, {
                    "ok": True, 
                    "raw_zip": zip_path,
                    "count": len(CURRENT_SESSION["images"]),
                    })
                return

            if self.path == "/pen/up":
                set_pen_up()
                self.send_json(200, {"ok": True, "pen": "up"})
                return

            if self.path == "/pen/down":
                set_pen_down()
                self.send_json(200, {"ok": True, "pen": "down"})
                return

            if self.path == "/eraser/up":
                set_eraser_up()
                self.send_json(200, {"ok": True, "eraser": "up"})
                return

            if self.path == "/eraser/down":
                set_eraser_down()
                self.send_json(200, {"ok": True, "eraser": "down"})
                return

            self.send_json(404, {"ok": False, "error": "not_found"})
        except Exception as e:
            self.send_json(500, {"ok": False, "error": str(e)})

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}")


if __name__ == "__main__":
    print(f"Pi server listening on {HOST}:{PORT}")
    init_actuators()
    HTTPServer((HOST, PORT), Handler).serve_forever()