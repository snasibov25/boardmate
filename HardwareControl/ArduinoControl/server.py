from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
import time
import threading
import serial
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import urlparse

from svg_plotter import svg_file_to_commands

SERIAL_PORT = "/dev/ttyHS1"
BAUD_RATE = 115200
UPLOAD_DIR = "/home/arduino/uploads"
RESULT_DIR = "/home/arduino/results"
HOST = "0.0.0.0"
PORT = 8000

PI_BASE = "http://10.108.136.174:8080"   # change this
PI_TIMEOUT = 100.0
PI_LONG_TIMEOUT = 100.0

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
serial_lock = threading.Lock()
job_lock = threading.Lock()

LAST_SCAN = {
    "pdf_path": None,
    "raw_zip_path": None,
    "captured_images": [],
}

def read_reply():
    deadline = time.time() + 5.0
    while time.time() < deadline:
        line = ser.readline().decode(errors="ignore").strip()
        if line:
            return line
    raise TimeoutError("Timed out waiting for Arduino reply")


def send_command(cmd, expect_ok=True):
    with serial_lock:
        ser.write((cmd + "\n").encode())
        ser.flush()

        if not expect_ok:
            return "SENT"

        reply = read_reply()
        if not reply.startswith("OK"):
            raise RuntimeError(f"Arduino returned: {reply}")
        return reply

stop_event = threading.Event()

def check_stop():
    if stop_event.is_set():
        raise RuntimeError("Stopped by user")

def send_stop():
    with serial_lock:
        ser.write(b"STOP\n")
        ser.flush()

def pi_post(path, payload=None, timeout=PI_TIMEOUT):
    if payload is None:
        payload = {}
    data = json.dumps(payload).encode("utf-8")
    req = Request(
        PI_BASE + path,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(req, timeout=timeout) as resp:
        body = resp.read().decode("utf-8")
        return json.loads(body)


def pi_get_json(path, timeout=PI_TIMEOUT):
    req = Request(PI_BASE + path, method="GET")
    with urlopen(req, timeout=timeout) as resp:
        body = resp.read().decode("utf-8")
        return json.loads(body)


def pi_download_file(path, save_path, timeout=PI_TIMEOUT):
    req = Request(PI_BASE + path, method="GET")
    with urlopen(req, timeout=timeout) as resp:
        data = resp.read()
    with open(save_path, "wb") as f:
        f.write(data)
    return save_path


def pi_expect_ok(callable_fn, *args, **kwargs):
    result = callable_fn(*args, **kwargs)
    if not result.get("ok"):
        raise RuntimeError(f"Pi returned failure: {result}")
    return result


def pi_pen_up():
    return pi_expect_ok(pi_post, "/pen/up")


def pi_pen_down():
    return pi_expect_ok(pi_post, "/pen/down")


def pi_eraser_up():
    return pi_expect_ok(pi_post, "/eraser/up")


def pi_eraser_down():
    return pi_expect_ok(pi_post, "/eraser/down")


def pi_scan_prepare():
    return pi_expect_ok(pi_post, "/scan/prepare")


def pi_scan_capture(index):
    return pi_expect_ok(pi_post, "/scan/capture", {"index": index})


def pi_scan_finalize():
    return pi_expect_ok(pi_post, "/scan/finalize")


def run_scan_sequence(erase, rowNum=4, colNum=6):
    with job_lock:
        stop_event.clear()

        LAST_SCAN["captured_images"] = []
        LAST_SCAN["pdf_path"] = None
        LAST_SCAN["raw_zip_path"] = None

        ROWS = rowNum
        COLS = colNum
        X_STEP = 400
        Y_STEP = 400

        FIRST_SETTLE = 0.25
        MOVE_SETTLE = 0.25
        SWEEP_SETTLE = 0.25  # small wait after long sweep

        pi_scan_prepare()

        send_command("EN")

        image_index = 0

        # Start at top-left scan point
        send_command("MVC 0 2000")
        time.sleep(FIRST_SETTLE)

        if erase:
            pi_eraser_down()

            # ERASE MODE:
            # Physically scan each row left->right only.
            # After each row (except last), sweep back left with no stops/captures,
            # move down one row, then scan right again.
            # To preserve the SAME logical image order as the normal serpentine scan,
            # reverse the captured row images for odd-numbered rows before storing.

            for row in range(ROWS):
                row_images = []

                # Capture first column of this row
                check_stop()
                result = pi_scan_capture(image_index)
                row_images.append(result["image"])
                image_index += 1

                # Move right across the row, capturing remaining columns
                for _ in range(COLS - 1):
                    check_stop()
                    send_command(f"MVR {X_STEP} 0")
                    time.sleep(MOVE_SETTLE)
                    check_stop()
                    result = pi_scan_capture(image_index)
                    row_images.append(result["image"])
                    image_index += 1

                # Preserve normal serpentine ordering in stored images
                if row % 2 == 0:
                    # even row in normal scan is left->right
                    LAST_SCAN["captured_images"].extend(row_images)
                else:
                    # odd row in normal scan is right->left
                    LAST_SCAN["captured_images"].extend(reversed(row_images))

                # Move to next row if not on last row
                if row < ROWS - 1:
                    check_stop()

                    # Big sweep back to the left with no stops/captures
                    total_left = -(COLS - 1) * X_STEP
                    send_command(f"MVR {total_left} 0")
                    time.sleep(SWEEP_SETTLE)

                    check_stop()

                    # Move down one row
                    send_command(f"MVR 0 {-Y_STEP}")
                    time.sleep(MOVE_SETTLE)

        else:
            # NORMAL MODE: original serpentine scan
            result = pi_scan_capture(image_index)
            LAST_SCAN["captured_images"].append(result["image"])
            image_index += 1

            for row in range(ROWS):
                if row % 2 == 0:
                    dx = X_STEP   # even row: move right
                else:
                    dx = -X_STEP  # odd row: move left

                for _ in range(COLS - 1):
                    check_stop()
                    send_command(f"MVR {dx} 0")
                    time.sleep(MOVE_SETTLE)
                    check_stop()
                    result = pi_scan_capture(image_index)
                    LAST_SCAN["captured_images"].append(result["image"])
                    image_index += 1

                if row < ROWS - 1:
                    check_stop()
                    send_command(f"MVR 0 {-Y_STEP}")
                    time.sleep(MOVE_SETTLE)
                    check_stop()
                    result = pi_scan_capture(image_index)
                    LAST_SCAN["captured_images"].append(result["image"])
                    image_index += 1

        if erase:
            pi_eraser_up()

        print("SCAN: finalize")
        finalize_result = pi_scan_finalize()
        print("SCAN: finalize result =", finalize_result)

        raw_local = os.path.join(RESULT_DIR, "raw_images.zip")

        print("SCAN: download raw")
        pi_download_file("/download/raw", raw_local, timeout=PI_LONG_TIMEOUT)
        print("SCAN: raw downloaded")

        LAST_SCAN["raw_zip_path"] = raw_local
        print("SCAN: complete")
        send_command("DS")

def run_erase_sequence():
    with job_lock:
        pi_eraser_down()
        time.sleep(0.5)
        pi_eraser_up()

def run_calibrate():
    with job_lock:
        send_command("CAL")

def run_svg_file(svg_path):
    with job_lock:
        stop_event.clear()
        commands = svg_file_to_commands(
            svg_path,
            max_x_steps=3000,
            max_y_steps=1800,
            keep_aspect=True,
            invert_y=True,
        )

        for cmd in commands:
            check_stop()
            print("SEND:", cmd)

            if cmd.startswith("MVC ") or cmd.startswith("MVR ") or cmd == "EN" or cmd == "DS" or cmd.startswith("SC "):
                send_command(cmd)
                continue

            if cmd == "PUP":
                pi_pen_up()
                continue

            if cmd == "PDN":
                pi_pen_down()
                continue

            if cmd == "ERU":
                pi_eraser_up()
                continue

            if cmd == "ERD":
                pi_eraser_down()
                continue

            raise RuntimeError(f"Unknown command from SVG pipeline: {cmd}")


class Handler(BaseHTTPRequestHandler):
    def _send_text(self, code, text):
        body = text.encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path, content_type, download_name=None):
        if not path or not os.path.exists(path):
            self._send_text(404, "File not found\n")
            return

        with open(path, "rb") as f:
            data = f.read()

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if download_name:
            self.send_header("Content-Disposition", f'attachment; filename="{download_name}"')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):

        parsed = urlparse(self.path)
        path = parsed.path.strip("/")
        parts = path.split("/") if path else []

        # -------------------------
        # Debug endpoints
        # -------------------------

        if len(parts) >= 2 and parts[0] == "debug":
            try:
                cmd = parts[1].lower()

                if cmd == "en":
                    reply = send_command("EN")
                    self._send_text(200, reply + "\n")
                    return

                if cmd == "ds":
                    reply = send_command("DS")
                    self._send_text(200, reply + "\n")
                    return

                if cmd == "pup":
                    result = pi_pen_up()
                    self._send_text(200, json.dumps(result) + "\n")
                    return

                if cmd == "pdn":
                    result = pi_pen_down()
                    self._send_text(200, json.dumps(result) + "\n")
                    return

                if cmd == "eru":
                    result = pi_eraser_up()
                    self._send_text(200, json.dumps(result) + "\n")
                    return

                if cmd == "erd":
                    result = pi_eraser_down()
                    self._send_text(200, json.dumps(result) + "\n")
                    return

                if cmd == "sc" and len(parts) == 4:
                    x = int(parts[2])
                    y = int(parts[3])
                    reply = send_command(f"SC {x} {y}")
                    self._send_text(200, reply + "\n")
                    return

                if cmd == "mvc" and len(parts) == 4:
                    x = int(parts[2])
                    y = int(parts[3])
                    reply = send_command(f"MVC {x} {y}")
                    self._send_text(200, reply + "\n")
                    return

                if cmd == "mvr" and len(parts) == 4:
                    dx = int(parts[2])
                    dy = int(parts[3])
                    reply = send_command(f"MVR {dx} {dy}")
                    self._send_text(200, reply + "\n")
                    return

                self._send_text(
                    400,
                    "Debug usage:\n"
                    "/debug/en\n"
                    "/debug/ds\n"
                    "/debug/pup\n"
                    "/debug/pdn\n"
                    "/debug/eru\n"
                    "/debug/erd\n"
                    "/debug/sc/<x>/<y>\n"
                    "/debug/mvc/<x>/<y>\n"
                    "/debug/mvr/<dx>/<dy>\n"
                )
                return

            except ValueError:
                self._send_text(400, "Bad numeric argument\n")
                return
            except Exception as e:
                self._send_text(500, f"Debug command failed: {e}\n")
                return

        if self.path == "/stop":
            try:
                stop_event.set()   # stop future commands
                send_stop()        # interrupt current Arduino move
                self._send_text(200, "Stop requested\n")
            except Exception as e:
                self._send_text(500, f"Stop failed: {e}\n")
            return
        
        if self.path == "/scan":
            try:
                run_scan_sequence(False)
                self._send_text(200, "Scan sequence complete\n")
            except Exception as e:
                self._send_text(500, f"Scan failed: {e}\n")
            return

        if self.path == "/scan-small":
            try:
                run_scan_sequence(False, 1, 6)
                self._send_text(200, "Scan sequence complete\n")
            except Exception as e:
                self._send_text(500, f"Scan failed: {e}\n")
            return

        if self.path == "/scan-erase":
            try:
                run_scan_sequence(True)
                self._send_text(200, "Scan sequence complete\n")
            except Exception as e:
                self._send_text(500, f"Scan failed: {e}\n")
            return

        if self.path == "/erase":
            try:
                run_erase_sequence()
                self._send_text(200, "Erase sequence complete\n")
            except Exception as e:
                self._send_text(500, f"Erase failed: {e}\n")
            return

        if self.path == "/draw":
            try:
                svg_path = os.path.join(UPLOAD_DIR, "upload.svg")
                run_svg_file(svg_path)
                self._send_text(200, "Draw sequence complete\n")
            except Exception as e:
                self._send_text(500, f"Draw failed: {e}\n")
            return
        
        """if self.path == "/calibrate":
            try:
                run_calibrate()
                self._send_text(200, "Scan sequence complete\n")
            except Exception as e:
                self._send_text(500, f"Scan failed: {e}\n")
            return"""

        if self.path == "/pi-ready":
            try:
                result = pi_expect_ok(pi_get_json, "/ready")
                self._send_text(200, f"Pi ready: {result}\n")
            except Exception as e:
                self._send_text(500, f"Pi not ready: {e}\n")
            return

        #if self.path == "/download/pdf":
        #    self._send_file(LAST_SCAN["pdf_path"], "application/pdf", "scan.pdf")
        #    return

        if self.path == "/download":
            self._send_file(LAST_SCAN["raw_zip_path"], "application/zip", "raw_images.zip")
            return

        if self.path == "/status":
            status = {
                "pdf_ready": LAST_SCAN["pdf_path"] is not None and os.path.exists(LAST_SCAN["pdf_path"]),
                "raw_ready": LAST_SCAN["raw_zip_path"] is not None and os.path.exists(LAST_SCAN["raw_zip_path"]),
                "captured_count": len(LAST_SCAN["captured_images"]),
                "pdf_path": LAST_SCAN["pdf_path"],
                "raw_zip_path": LAST_SCAN["raw_zip_path"],
            }
            self._send_text(200, json.dumps(status) + "\n")
            return

        self._send_text(404, "Use GET /scan, /erase, /draw, /pi-ready, /status, /download/pdf, /download/raw or POST /upload\n")

    def do_POST(self):
        if self.path != "/upload":
            self._send_text(404, "Use POST /upload\n")
            return

        length = int(self.headers.get("Content-Length", 0))
        filename = "upload.svg"
        save_path = os.path.join(UPLOAD_DIR, filename)

        with open(save_path, "wb") as f:
            f.write(self.rfile.read(length))

        self._send_text(200, f"Uploaded to {save_path}\n")

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")


if __name__ == "__main__":
    print(f"Listening on {HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()