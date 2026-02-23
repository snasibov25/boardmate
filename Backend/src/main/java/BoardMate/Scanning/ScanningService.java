package BoardMate.Scanning;

import org.springframework.stereotype.Service;

@Service
public class ScanningService {

    public ScanningResponse executeScan() {
        try {
            // // TODO: SSH to Raspberry Pi and execute Python script
            String cmd = "ssh pi@snorlax 'python3 /home/pi/scan.py'";
            Process process = Runtime.getRuntime().exec(cmd);

            // Optional: read stdout/stderr
            process.waitFor();

            return new ScanningResponse(true, "active");
        } catch (Exception e) {
            e.printStackTrace();
            return new ScanningResponse(false, "stopped");
        }
    }
}
