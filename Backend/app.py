from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # allows requests from your React dev server

ARDUINO_IP = "http://10.171.204.214:8000" #changes sometime 

@app.route("/api/robot/commands", methods=["POST"])
def robot_command():
    data = request.json or {}
    cmd = data.get("command", "")
    print(f"Received command: {cmd}")
    try:
        if cmd == "start scan":
            print("Sending GET to Arduino /scan")
            res = requests.get(f"{ARDUINO_IP}/scan")
            print(f"Arduino response: {res.status_code}")
            return jsonify(success=True, robotStatus="scan started")
        elif cmd == "start clean":
            print("Sending GET to Arduino /erase")
            res = requests.get(f"{ARDUINO_IP}/erase")
            print(f"Arduino response: {res.status_code}")
            return jsonify(success=True, robotStatus="clean started")
        elif cmd == "start write":
            print("Sending GET to Arduino /draw")
            res = requests.get(f"{ARDUINO_IP}/draw")
            print(f"Arduino response: {res.status_code}")
            return jsonify(success=True, robotStatus="write started")
        elif cmd == "upload pdf": 
            print ("Sending GET to Arduino /upload ")
            res = requests.get(f"{ARDUINO_IP}/upload")
            print(f"Arduino response: {res.status_code}")
        elif cmd =="stop": 
            print("Sending GET to Arduino /stop")
            res = requests.get(f"{ARDUINO_IP}/stop")
            print(f"Arduino response: {res.status_code}")
            return jsonify(success=True, robotStatus="stopped")
        else:
            print(f"Unknown command: {cmd}")
            return jsonify(success=False, message="Unknown command")
    except requests.RequestException as e:
        print(f"Error contacting Arduino: {e}")
        return jsonify(success=False, message=str(e))


@app.route("/api/upload/svg", methods=["POST"])
def upload_svg():
    if 'file' not in request.files:
        return jsonify(success=False, message="No file part")
    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, message="No selected file")
    try:
        # Send the file directly to Arduino as binary data
        res = requests.post(f"{ARDUINO_IP}/upload", data=file.stream)
        print(f"Upload to Arduino: {res.status_code}")
        return jsonify(success=res.status_code == 200, message=f"Upload status: {res.status_code}")
    except requests.RequestException as e:
        print(f"Error uploading to Arduino: {e}")
        return jsonify(success=False, message=str(e))


if __name__ == "__main__":
    # Run the Flask server on port 5000 so the React frontend can connect.
    # Use 0.0.0.0 so it is accessible from localhost and Docker, if needed.
    app.run(host="0.0.0.0", port=5000, debug=True)