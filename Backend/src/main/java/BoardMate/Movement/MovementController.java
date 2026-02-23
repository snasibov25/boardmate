package BoardMate.Movement;

import BoardMate.Movement.MovementRequest;
import BoardMate.Movement.MovementResponse;
import BoardMate.Movement.MovementService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/robot")
@CrossOrigin(origins = "http://localhost:5173")
public class MovementController {

    private final MovementService movementService;

    public MovementController(MovementService movementService) {
        this.movementService = movementService;
    }

    @PostMapping("/MoveInXaxis")
    public MovementResponse moveInXaxis(@RequestBody MovementRequest move){
        return movementService.moveX(move);
    }

    @PostMapping("/MoveInYaxis")
    public MovementResponse moveInYaxis(@RequestBody MovementRequest move){
        return movementService.moveY(move);
    }

    @PostMapping("/start")
    public MovementResponse startRobot(){
        return movementService.startRobot();
    }

    @PostMapping("/pause")
    public MovementResponse pauseRobot(){
        return movementService.pauseRobot();
    }

    @PostMapping("/stop")
    public MovementResponse stopRobot(){
        return movementService.stopRobot();
    }
}