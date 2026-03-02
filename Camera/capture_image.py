from pathlib import Path
from time import sleep
import subprocess
BASE_DIR = Path(__file__).resolve().parent


LOCAL_DIR = BASE_DIR / "Image"
LOCAL_DIR.mkdir(parents=True, exist_ok=True)

REMOTE_USER_HOST = "pi@snorlax"
REMOTE_DIR = "/home/pi"
NUM_IMAGES = 6

for i in range(NUM_IMAGES):
    remote_file = f"{REMOTE_USER_HOST}:{REMOTE_DIR}/test{i}.jpg"
    subprocess.run(["scp", remote_file, str(LOCAL_DIR)], check=True)
    sleep(1)