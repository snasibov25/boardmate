package BoardMate.demo.Movement;

import org.springframework.web.bind.annotation.*;

/**
 * REST controller to expose robot control endpoints.
 */
@RestController
@RequestMapping("/api/robot")
public class MovementController {

    private final MovementService movementService;

    public MovementController(MovementService movementService) {
        this.movementService = movementService;
    }

    /**
     * Move robot along X axis
     */
    @PostMapping("/MoveInXaxis")
    public MovementResponse moveInXaxis(@RequestBody MovementRequest move){
        return movementService.moveX(move);
    }

    /**
     * Move robot along Y axis
     */
    @PostMapping("/MoveInYaxis")
    public MovementResponse moveInYaxis(@RequestBody MovementRequest move){
        return movementService.moveY(move);
    }

    /**
     * Start the robot
     */
    @PostMapping("/start")
    public MovementResponse startRobot(){
        return movementService.startRobot();
    }
    /**
     * Start the robot demo
     */
    @PostMapping("/startDemo")
    public MovementResponse startDemo(){
        return movementService.rundemo();
    }
    /**
     * Start the robot test
     */
    @PostMapping("/startTest")
    public MovementResponse startTest(){
        return movementService.runtest();
    }


    /**
     * Pause the robot
     */
    @PostMapping("/pause")
    public MovementResponse pauseRobot(){
        return movementService.pauseRobot();
    }

    /**
     * Stop the robot
     */
    @PostMapping("/stop")
    public MovementResponse stopRobot(){
        return movementService.stopRobot();
    }
}