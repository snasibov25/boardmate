# BoardMate

# Software team

## Demo 2
- web UI design
- scanning and image processing
- idea for Hardware–Software Integration

## Hardware–Software Integration
- Detect if motor is stuck or unresponsive
- Trigger retake or pause cleaning if motor fault is detected
- Document must be confirmed saved before cleaning can be triggered
- Cleaning cannot start if scanning is still in progress
- Real-time motor status shown on dashboard
- Notify user if hardware disconnects 
- The basic step: Idle → Scanning → Scan Complete → Check the document is clear → Cleaning → Done. If any step fails, the system notify to user and returns to a safe idle state prepare to retake
- If cleaning/scanning is interrupted midway, the system should log where it stopped for recovery or restart from beginning(probably for hardware)


## Description of Folders and Files (incomplete)

### Frontend 
- Capture_image.py: 
    - Ssh's into the Raspberry pi 
    - Takes a number of pictures 
    - Returns jpg images in a directory 

- ConnectToCamera.py
    - SSH's into the Raspberry Pi 
    - Runs command to connect to the Raspberry Pi camera 

- jpg_to_pdf.py 
    - Takes the jpg inputs 
    - Converts the jpg to pdf 
    - Returns a pdf 

- 