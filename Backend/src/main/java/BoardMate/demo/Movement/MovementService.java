package BoardMate.demo.Movement;

import BoardMate.demo.Serial.SerialService;
import org.springframework.stereotype.Service;

@Service
public class MovementService {

    private final SerialService serialService;

    public MovementService(SerialService serialService) {
        this.serialService = serialService;
    }

    public MovementResponse sendCommand(String command) {

        if (command == null || command.trim().isEmpty()) {
            return new MovementResponse(false, "Command cannot be empty");
        }

        String trimmedCommand = command.trim();

        new Thread(() -> {
            try {
                System.out.println("Sending command: " + trimmedCommand);
                boolean success = serialService.sendCommand(trimmedCommand);

                if (success) {
                    System.out.println("Command executed successfully");
                } else {
                    System.err.println("Command failed");
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        return new MovementResponse(true, "Command sent: " + trimmedCommand);
    }
}