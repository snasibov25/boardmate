package BoardMate.Scanning;

public class ScanningResponse {
    private boolean success;
    private String robotStatus;

    public ScanningResponse(boolean success, String robotStatus) {
        this.success = success;
        this.robotStatus = robotStatus;
    }

    public boolean isSuccess() { return success; }
    public String getRobotStatus() { return robotStatus; }
}
