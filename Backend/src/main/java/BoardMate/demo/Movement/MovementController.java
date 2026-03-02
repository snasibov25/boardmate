package BoardMate.demo.Movement;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/robot")
public class MovementController {

    private final MovementService movementService;

    public MovementController(MovementService movementService) {
        this.movementService = movementService;
    }

    /**
     * Send a command to the robot
     *
     * Example request:
     * POST /api/robot/commands
     * Body:
     * {
     *   "command": "goto 100 50"
     * }
     */
    @PostMapping("/commands")
    public MovementResponse sendCommand(@RequestBody CommandRequest request) {
        return movementService.sendCommand(request.getCommand());
    }
}