#define STP_X 2
#define DIR_X 3
#define STP_Y 8
#define DIR_Y 9
#define MS1 4
#define MS2 5
#define MS3 6
#define EN_PIN 7
/*
#define ERASER_SOL A2
#define PEN_SOL A3
*/

#define X_BUTTON A1
#define Y_BUTTON A3

volatile bool stopRequested = false;

int pos[2] = {0, 0};

// Change these if your hardware is inverted
const bool MOTOR_ENABLE_ACTIVE = LOW;     // common for stepper drivers
const bool MOTOR_DISABLE_ACTIVE = HIGH;

const bool PEN_UP_STATE = LOW;
const bool PEN_DOWN_STATE = HIGH;

const bool ERASER_UP_STATE = LOW;
const bool ERASER_DOWN_STATE = HIGH;

const unsigned int STEP_PULSE_US = 500;
const unsigned int STEP_SETTLE_US = 500;

String inputLine = "";

void pollSerialForStop() {
  while (Serial1.available() > 0) {
    char c = (char)Serial1.read();

    if (c == '\n') {
      inputLine.trim();
      if (inputLine == "STOP") {
        stopRequested = true;
      }
      inputLine = "";
    } else if (c != '\r') {
      inputLine += c;
    }
  }
}

void pulseStepPin(int pin) {
  digitalWrite(pin, HIGH);
  delayMicroseconds(STEP_PULSE_US);
  digitalWrite(pin, LOW);
  delayMicroseconds(STEP_SETTLE_US);
}

void motorsEnable() {
  digitalWrite(EN_PIN, MOTOR_ENABLE_ACTIVE);
}

void motorsDisable() {
  digitalWrite(EN_PIN, MOTOR_DISABLE_ACTIVE);
}
/*
void penUp() {
  digitalWrite(PEN_SOL, PEN_UP_STATE);
}

void penDown() {
  digitalWrite(PEN_SOL, PEN_DOWN_STATE);
}

void eraserUp() {
  digitalWrite(ERASER_SOL, ERASER_UP_STATE);
}

void eraserDown() {
  digitalWrite(ERASER_SOL, ERASER_DOWN_STATE);
}
*/
void setCoords(int x, int y) {
  pos[0] = x;
  pos[1] = y;
}

bool xHomed() {
  return digitalRead(X_BUTTON) == LOW;   // pressed
}

bool yHomed() {
  return digitalRead(Y_BUTTON) == LOW;   // pressed
}
/*
void calibrate() {
  motorsEnable();

  // Move X left until X limit switch is pressed
  digitalWrite(DIR_X, LOW);   // adjust if your left direction is opposite
  while (!xHomed()) {
    pulseStepPin(STP_X);
  }

  // Back off a little from the switch
  digitalWrite(DIR_X, HIGH);
  for (int i = 0; i < 50; i++) {
    pulseStepPin(STP_X);
  }

  // Approach slowly again for a more accurate home
  digitalWrite(DIR_X, LOW);
  while (!xHomed()) {
    pulseStepPin(STP_X);
    delayMicroseconds(1500);
  }

  // Move Y down until Y limit switch is pressed
  digitalWrite(DIR_Y, LOW);   // adjust if your down direction is opposite
  while (!yHomed()) {
    pulseStepPin(STP_Y);
  }

  // Back off a little from the switch
  digitalWrite(DIR_Y, HIGH);
  for (int i = 0; i < 50; i++) {
    pulseStepPin(STP_Y);
  }

  // Approach slowly again for a more accurate home
  digitalWrite(DIR_Y, LOW);
  while (!yHomed()) {
    pulseStepPin(STP_Y);
    delayMicroseconds(1500);
  }

  setCoords(0, 0);
}
*/
void moveStepsTo(int targetX, int targetY, float feedStepsPerSec = 1000.0f) {
  
  stopRequested = false;

  long dx = (long)targetX - pos[0];
  long dy = (long)targetY - pos[1];

  long ax = labs(dx);
  long ay = labs(dy);

  if (ax == 0 && ay == 0) {
    return;
  }

  // Set directions
  digitalWrite(DIR_X, dx >= 0 ? HIGH : LOW);
  digitalWrite(DIR_Y, dy >= 0 ? HIGH : LOW);

  long sx = (dx >= 0) ? 1 : -1;
  long sy = (dy >= 0) ? 1 : -1;

  long steps = max(ax, ay);

  // Path length in step units
  float length = sqrtf((float)dx * (float)dx + (float)dy * (float)dy);

  // Total time for the move at the requested feed rate
  float totalTimeSec = length / feedStepsPerSec;

  // Time per Bresenham tick
  float tickTimeSec = totalTimeSec / (float)steps;
  unsigned long tickTimeUs = (unsigned long)(tickTimeSec * 1000000.0f);

  // Make sure the pulse width fits inside the tick
  const unsigned long pulseWidthUs = 5;
  if (tickTimeUs < pulseWidthUs + 2) {
    tickTimeUs = pulseWidthUs + 2;
  }

  long errX = 0;
  long errY = 0;

  for (long i = 0; i < steps; i++) {
    pollSerialForStop();
    if (stopRequested) {
      return;
    }
    bool stepX = false;
    bool stepY = false;

    errX += ax;
    errY += ay;

    if (errX >= steps) {
      errX -= steps;
      stepX = true;
    }

    if (errY >= steps) {
      errY -= steps;
      stepY = true;
    }

    unsigned long t0 = micros();

    if (stepX) digitalWrite(STP_X, HIGH);
    if (stepY) digitalWrite(STP_Y, HIGH);

    delayMicroseconds(pulseWidthUs);

    if (stepX) {
      digitalWrite(STP_X, LOW);
      pos[0] += sx;
    }

    if (stepY) {
      digitalWrite(STP_Y, LOW);
      pos[1] += sy;
    }

    // Wait until the full tick time has elapsed
    while ((micros() - t0) < tickTimeUs) {
      pollSerialForStop();
      if (stopRequested) {
        return;
      }
    }
  }

  pos[0] = targetX;
  pos[1] = targetY;
}

void moveRelative(int dx, int dy) {
  moveStepsTo(pos[0] + dx, pos[1] + dy);
}

void sendOk() {
  Serial1.print("OK ");
  Serial1.print(pos[0]);
  Serial1.print(" ");
  Serial1.println(pos[1]);
}

void sendErr(const char* msg) {
  Serial1.print("ERR ");
  Serial1.println(msg);
}

void handleCommand(String line) {
  line.trim();
  if (line.length() == 0) {
    return;
  }
/*
  if (line == "PUP") {
    penUp();
    sendOk();
    return;
  }

  if (line == "PDN") {
    penDown();
    sendOk();
    return;
  }

  if (line == "ERU") {
    eraserUp();
    sendOk();
    return;
  }

  if (line == "ERD") {
    eraserDown();
    sendOk();
    return;
  }
*/
  if (line == "EN") {
    motorsEnable();
    sendOk();
    return;
  }

  if (line == "STOP") {
  stopRequested = true;
  sendOk();
  return;
  }

  if (line == "DS") {
    motorsDisable();
    sendOk();
    return;
  }

/*  if (line == "CAL") {
  calibrate();
  sendOk();
  return;
  }
*/
  int firstSpace = line.indexOf(' ');
  if (firstSpace < 0) {
    sendErr("bad_command");
    return;
  }

  String cmd = line.substring(0, firstSpace);
  String rest = line.substring(firstSpace + 1);
  rest.trim();

  int secondSpace = rest.indexOf(' ');
  if (secondSpace < 0) {
    sendErr("missing_arg");
    return;
  }

  String sx = rest.substring(0, secondSpace);
  String sy = rest.substring(secondSpace + 1);
  sx.trim();
  sy.trim();

  int x = sx.toInt();
  int y = sy.toInt();

  if (cmd == "MVR") {
    moveRelative(x, y);
    sendOk();
    return;
  }

  if (cmd == "MVC") {
    moveStepsTo(x, y);
    sendOk();
    return;
  }

  if (cmd == "SC") {
    setCoords(x, y);
    sendOk();
    return;
  }

  sendErr("unknown_command");
}

void setup() {
  pinMode(STP_X, OUTPUT);
  pinMode(DIR_X, OUTPUT);
  pinMode(STP_Y, OUTPUT);
  pinMode(DIR_Y, OUTPUT);

  pinMode(MS1, OUTPUT);
  pinMode(MS2, OUTPUT);
  pinMode(MS3, OUTPUT);
  pinMode(EN_PIN, OUTPUT);

  //pinMode(ERASER_SOL, OUTPUT);
  //pinMode(PEN_SOL, OUTPUT);

  pinMode(X_BUTTON, INPUT_PULLUP);
  pinMode(Y_BUTTON, INPUT_PULLUP);

  digitalWrite(STP_X, LOW);
  digitalWrite(STP_Y, LOW);

  // Example microstepping setup: full step
  digitalWrite(MS1, LOW);
  digitalWrite(MS2, LOW);
  digitalWrite(MS3, LOW);

  //penUp();
  //eraserUp();
  motorsDisable();

  Serial1.begin(115200);
}

void loop() {
  while (Serial1.available() > 0) {
    char c = (char)Serial1.read();

    if (c == '\n') {
      handleCommand(inputLine);
      inputLine = "";
    } else if (c != '\r') {
      inputLine += c;
    }
  }
}