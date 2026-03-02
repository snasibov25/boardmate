package BoardMate.demo.Movement;

/**
 * Represents a movement request for the robot stepper motor.
 * Maps Arduino pins and movement parameters to a Java object
 * that can be received from frontend requests.
 */
public class CommandRequest {

    private String command;

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }
}