package BoardMate.demo.Movement;

/**
 * Represents a movement request for the robot stepper motor.
 * Maps Arduino pins and movement parameters to a Java object
 * that can be received from frontend requests.
 */
public class MovementRequest {

    // Arduino pin numbers
    private int stepPin;    // Corresponds to Arduino STP
    private int dirPin;     // Corresponds to Arduino DIR
    private int ms1Pin;     // Corresponds to Arduino MS1
    private int ms2Pin;     // Corresponds to Arduino MS2
    private int ms3Pin;     // Corresponds to Arduino MS3
    private int enPin;      // Corresponds to Arduino EN

    // Movement parameters
    private int steps;        // Number of steps to move
    private boolean direction; // true = forward, false = backward
    private boolean enable;    // true = motor enabled, false = disabled

    public MovementRequest() {
    }

    public MovementRequest(int stepPin, int dirPin, int ms1Pin, int ms2Pin, int ms3Pin, int enPin,
                           int steps, boolean direction, boolean enable) {
        this.stepPin = stepPin;
        this.dirPin = dirPin;
        this.ms1Pin = ms1Pin;
        this.ms2Pin = ms2Pin;
        this.ms3Pin = ms3Pin;
        this.enPin = enPin;
        this.steps = steps;
        this.direction = direction;
        this.enable = enable;
    }

    // -------- Getters & Setters --------
    public int getStepPin() { return stepPin; }
    public void setStepPin(int stepPin) { this.stepPin = stepPin; }

    public int getDirPin() { return dirPin; }
    public void setDirPin(int dirPin) { this.dirPin = dirPin; }

    public int getMs1Pin() { return ms1Pin; }
    public void setMs1Pin(int ms1Pin) { this.ms1Pin = ms1Pin; }

    public int getMs2Pin() { return ms2Pin; }
    public void setMs2Pin(int ms2Pin) { this.ms2Pin = ms2Pin; }

    public int getMs3Pin() { return ms3Pin; }
    public void setMs3Pin(int ms3Pin) { this.ms3Pin = ms3Pin; }

    public int getEnPin() { return enPin; }
    public void setEnPin(int enPin) { this.enPin = enPin; }

    public int getSteps() { return steps; }
    public void setSteps(int steps) { this.steps = steps; }

    public boolean isDirection() { return direction; }
    public void setDirection(boolean direction) { this.direction = direction; }

    public boolean isEnable() { return enable; }
    public void setEnable(boolean enable) { this.enable = enable; }

    @Override
    public String toString() {
        return "MovementRequest{" +
                "stepPin=" + stepPin +
                ", dirPin=" + dirPin +
                ", ms1Pin=" + ms1Pin +
                ", ms2Pin=" + ms2Pin +
                ", ms3Pin=" + ms3Pin +
                ", enPin=" + enPin +
                ", steps=" + steps +
                ", direction=" + direction +
                ", enable=" + enable +
                '}';
    }
}