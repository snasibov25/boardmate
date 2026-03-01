package BoardMate.demo.Movement;

import BoardMate.demo.Serial.SerialService;
import org.springframework.stereotype.Service;

@Service
public class MovementService {
    /**
     * Start the robot demo
     * Sends command "1" to Arduino
     */
    public MovementResponse rundemo() {
        // 使用线程异步执行，立刻给前端返回“指令已发送”
        new Thread(() -> {
            try {
                boolean success = SerialService.sendCommand("1");
                if (!success) {
                    System.err.println("Demo hardware trigger failed.");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        // 立刻返回响应，这样前端的 Toast 就能秒出
        return new MovementResponse(true, "Demo sequence triggered");
    }

    /**
     * Run motor test
     * Sends command "2" to Arduino
     */
    public MovementResponse runtest() {
        // 异步执行，防止阻塞 Web 主线程导致连接重置
        new Thread(() -> {
            try {
                System.out.println("开始执行硬件测试任务...");
                boolean success = SerialService.sendCommand("2");
                if (success) {
                    System.out.println("硬件测试任务启动成功 (收到 OK)");
                } else {
                    System.err.println("硬件测试任务启动失败 (超时未收到 OK)");
                }
            } catch (Exception e) {
                System.err.println("串口通信异常: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();

        // 只要线程成功开启，立刻给前端返回响应
        return new MovementResponse(true, "Test instruction sent, running in background");
    }
    /**
     * Move the robot along the X axis
     * @param move - movement parameters including steps, direction, enable pins
     * @return MovementResponse containing success status and message
     */
    public MovementResponse moveX(MovementRequest move) {
        // TODO: Implement sending X-axis move command to the motor controller
        return null;
    }

    /**
     * Move the robot along the Y axis
     * @param move - movement parameters including steps, direction, enable pins
     * @return MovementResponse containing success status and message
     */
    public MovementResponse moveY(MovementRequest move) {
        // TODO: Implement sending Y-axis move command to the motor controller
        return null;
    }

    /**
     * Start the robot
     * @return MovementResponse indicating whether the robot successfully started
     */
    public MovementResponse startRobot() {
        // TODO: Implement robot start logic
        return null;
    }

    /**
     * Pause the robot
     * @return MovementResponse indicating whether the robot was successfully paused
     */
    public MovementResponse pauseRobot() {
        // TODO: Implement robot pause logic
        return null;
    }

    /**
     * Stop the robot
     * @return MovementResponse indicating whether the robot successfully stopped
     */
    public MovementResponse stopRobot() {
        // TODO: Implement robot stop logic
        return null;
    }
}