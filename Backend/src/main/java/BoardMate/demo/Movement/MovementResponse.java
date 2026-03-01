package BoardMate.demo.Movement;

public class MovementResponse {
    private boolean success;       // Whether the command succeeded
    private String robotStatus;    // Current status of the robot: "active", "paused", "stopped"

    public MovementResponse() {}

    public MovementResponse(boolean success, String robotStatus) {
        this.success = success;
        this.robotStatus = robotStatus;
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getRobotStatus() {
        return robotStatus;
    }

    public void setRobotStatus(String robotStatus) {
        this.robotStatus = robotStatus;
    }
}