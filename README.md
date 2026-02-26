#BoardMate

#Software team
##Demo 2
- web UI design
- scanning and image processing
- idea for Hardware–Software Integration

##Hardware–Software Integration
- Detect if motor is stuck or unresponsive
- Trigger retake or pause cleaning if motor fault is detected
- Document must be confirmed saved before cleaning can be triggered
- Cleaning cannot start if scanning is still in progress
- Real-time motor status shown on dashboard
- Notify user if hardware disconnects 
- The basic step: Idle → Scanning → Scan Complete → Check the document is clear → Cleaning → Done. If any step fails, the system notify to user and returns to a safe idle state prepare to retake
- If cleaning/scanning is interrupted midway, the system should log where it stopped for recovery or restart from beginning(probably for hardware)
