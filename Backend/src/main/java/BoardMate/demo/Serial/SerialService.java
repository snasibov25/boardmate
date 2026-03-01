package BoardMate.demo.Serial;

import com.fazecast.jSerialComm.SerialPort;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.io.OutputStream;

@Component
public class SerialService {

    private SerialPort port;
    private static InputStream in;
    private static OutputStream out;

    @PostConstruct
    public void init() throws Exception {
        port = SerialPort.getCommPort("COM7");
        port.setBaudRate(9600);
        port.openPort();
        in = port.getInputStream();
        out = port.getOutputStream();
        Thread.sleep(2000);
    }

    /**
     * Send a command to Arduino and wait for "OK"
     */
    public static synchronized boolean sendCommand(String command) throws Exception {
        if (out == null) return false;

        // 清空缓冲区旧数据，防止干扰
        while (in.available() > 0) in.read();

        // 发送命令
        out.write((command + "\n").getBytes());
        out.flush();

        StringBuilder sb = new StringBuilder();
        long startTime = System.currentTimeMillis();
        long timeout = 5000; // 设置 5 秒超时，防止死循环

        while (System.currentTimeMillis() - startTime < timeout) {
            if (in.available() > 0) {
                char c = (char) in.read();
                if (c == '\n') {
                    String reply = sb.toString().trim();
                    sb.setLength(0);
                    // 打印日志方便调试
                    System.out.println("Arduino Reply: " + reply);
                    if (reply.contains("OK")) return true;
                } else {
                    sb.append(c);
                }
            }
            Thread.sleep(10);
        }
        System.err.println("TIMEOUT: Arduino failed to respond OK for command: " + command);
        return false;
    }
}