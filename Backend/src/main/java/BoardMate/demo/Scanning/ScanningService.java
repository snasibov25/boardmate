package BoardMate.demo.Scanning;

import org.springframework.stereotype.Service;
import java.nio.file.Paths;

@Service
public class ScanningService {

    public ScanningResponse executeScan() {
        try {
            String scriptPath = Paths.get(System.getProperty("user.dir"))
                    .getParent()
                    .resolve("Camera")
                    .resolve("run_all.py")
                    .toString();

            ProcessBuilder pb = new ProcessBuilder("python3", scriptPath);
            pb.inheritIO();
            System.out.println(" Running run_all.py at: " + scriptPath); 
            Process process = pb.start();
            process.waitFor();

            return new ScanningResponse(true, "active");
        } catch (Exception e) {
            e.printStackTrace();
            return new ScanningResponse(false, "stopped");
        }
    }
}