package BoardMate.demo.Scanning;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ScanningController {

    private final ScanningService scanningService;

    public ScanningController(ScanningService scanningService) {
        this.scanningService = scanningService;
    }

    @PostMapping("/scan")
    public ScanningResponse scan(@RequestBody ScanningRequest request) {
        if (request.isStart_scanning()) {
            // Trigger Python script
            return scanningService.executeScan();
        } else {
            return new ScanningResponse(false, "stopped");
        }
    }
}
