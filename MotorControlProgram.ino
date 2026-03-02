#define stpX 2
#define dirX 3
#define stpY 8
#define dirY 9
#define MS1 4
#define MS2 5
#define MS3 6
#define EN 7
//Declare variables for functions
char user_input;
int i;
int j;
int state;
int x = 0;
int y = 1;

int delayTime = 500;

/* directional arrays
 * 
 * These are set up in the following way 
 * 
 * {motor count, axis / directionX, direction / directionY}
 */
bool u[3] = {LOW, HIGH, HIGH}; // 011
bool d[3] = {LOW, HIGH, LOW}; //010
bool l[3] = {LOW, LOW, LOW};
bool r[3] = {LOW, LOW, HIGH};

bool ur[4] = {HIGH, HIGH, HIGH};
bool ru[4] = {HIGH, HIGH, HIGH};

bool dr[4] = {HIGH, HIGH, LOW};
bool rd[4] = {HIGH, HIGH, LOW};

bool ul[4] = {HIGH, LOW, HIGH};
bool lu[4] = {HIGH, LOW, HIGH};

bool dl[4] = {HIGH, LOW, LOW};
bool ld[4] = {HIGH, LOW, LOW};

int pos[2] = {0, 0};


//dual button pin declaration
const int button1 = A0;  // SIG1 - green 
const int button2 = A1;  // SIG2 - red 


void setup() {
  // put your setup code here, to run once:
  pinMode(stpX, OUTPUT);
  pinMode(dirX, OUTPUT);
  pinMode(stpY, OUTPUT);
  pinMode(dirY, OUTPUT);
  pinMode(MS1, OUTPUT);
  pinMode(MS2, OUTPUT);
  pinMode(MS3, OUTPUT);
  pinMode(EN, OUTPUT);

  
  //assigning input to buttons
  pinMode(button1, INPUT);
  pinMode(button2, INPUT);

  
  resetBEDPins(); //Set step, direction, microstep and enable pins to default states
  Serial.begin(9600);
  Serial.println("Motor Control Program v0.2");
  Serial.println("");
  Serial.println("Enter \"help\" for command list");
  Serial.println("");
}

void resetBEDPins() {
  digitalWrite(stpX, LOW);
  digitalWrite(dirX, LOW);
  digitalWrite(MS1, LOW);
  digitalWrite(MS2, LOW);
  digitalWrite(MS3, LOW);
  digitalWrite(EN, HIGH);
}

void loop() {
  // put your main code here, to run repeatedly:

    if (digitalRead(button1) == LOW) {
      delay(50);  // debounce
      if (digitalRead(button1) == LOW) {
        digitalWrite(EN, LOW);   // enable motors
        Serial.println("Button 1 pressed");
        demo();
        resetBEDPins();
        delay(200);  // prevent repeat triggering
      }
     
  }

  if (digitalRead(button2) == LOW) {
    
    delay(50);  // debounce
      if (digitalRead(button2) == LOW) {
        digitalWrite(EN, LOW);   // enable motors
        Serial.println("Button 2 pressed");
        motorTest();
        resetBEDPins();
        delay(200);  // prevent repeat triggering
      }
  }
  
  
  while(Serial.available()){
    String input = Serial.readStringUntil('\n');
    input.trim();
    digitalWrite(EN, LOW); //Pull enable pin low to set FETs active and allow motor control

    // Split input into two parts, command and data, based on the first space
    
    String cmd = input; // Command part
    String data = input; // Data part

    int spaceIndex = input.indexOf(' ');

    if (spaceIndex != -1) {
      cmd = input.substring(0, spaceIndex);    // Extract the command (before space)
      data = input.substring(spaceIndex + 1);  // Extract the data (after space)
    } else {
      cmd = input;  // If no space, the whole input is just the command
    }
    cmd.toLowerCase();
    data.toLowerCase(); 
    // Command handling
    
    if (cmd == "help") {
/*    Serial.println("=== COMMAND LIST ===");
      Serial.println(" - help             : Prints the command list in the serial monitor");
      Serial.println(" - test             : Tests simultaneous and individual motor movement");
      Serial.println(" - demo             : Runs the demo script for scanning the whole whiteboard");
      Serial.println(" - goto <x> <y>     : Whiteboard carriage will go to the coordinates <x> and <y>, given as integers");
      Serial.println(" - move <dir> <dst> : Whiteboard carriage will move <dst> steps in <dir> direction");
      Serial.println(" - getpos           : Prints the current position of the carriage");
      Serial.println(" - hold <time>      : Holds the carriage for the specified time in multiples of step time");
      Serial.println(" - speed <time>     : sets the length of time for a step in microseconds");
      Serial.println(" - getspeed         : Prints the current speed of the carriage");
      Serial.println(" - freq <Hz>        : sets the length of time for a step in microseconds so the steps occur at the given <Hz>");
      Serial.println(" - mvet <dst> <len> : sets the length of time for a step in microseconds so the steps occur at the given <Hz>");
*/
    }
    else if (cmd == "test") {
      motorTest();    
    }
    else if (cmd == "samsung") {
      samsung();    
    }
    else if (cmd == "demo") {
      demo();
    }
    else if (cmd == "getpos") {
      getPos();
    }
    else if (cmd == "getSpeed") {
      getSpeed();
    }
    else if (cmd == "goto") {
      // Parse x and y from data
      int spaceIndex = data.indexOf(' ');

      if (spaceIndex != -1) {
        String xStr = data.substring(0, spaceIndex);       // Get x value (before space)
        String yStr = data.substring(spaceIndex + 1);      // Get y value (after space)

        int xPos = xStr.toInt();   // Convert to int
        int yPos = yStr.toInt();   // Convert to int

        goTo(xPos, yPos);  // Call goTo with parsed coordinates
      } else {
        Serial.println("Invalid format for 'goto'. Use: goto x y");
      }
    }    
    else if (cmd == "hold") {
      int holdTime = data.toInt();
      hold(holdTime);
    }
    else if (cmd == "speed") {
      int delaytime = data.toInt();
      setSpeed(delaytime);
    }
    else if (cmd == "freq") {
      int freq = data.toInt();
      setFrequency(freq);
    }
    else if (cmd == "move") {
      // Parse direction and distance from data
      int spaceIndex = data.indexOf(' ');

      if (spaceIndex != -1) {
        String direction = data.substring(0, spaceIndex);       // Get x value (before space)
        int distance = data.substring(spaceIndex + 1).toInt();      // Get y value (after space)
        bool* dir = nullptr;
        direction.toLowerCase();
        
        if (direction == "l") {
          dir = l;
        } else if (direction == "r") {
          dir = r;
        } else if (direction == "u") {
          dir = u;
        } else if (direction == "d") {
          dir = d;
        } else if (direction == "ld") {
          dir = ld;
        } else if (direction == "dl") {
          dir = dl;
        } else if (direction == "lu") {
          dir = lu;
        } else if (direction == "ul") {
          dir = ul;
        } else if (direction == "ur") {
          dir = ur;
        } else if (direction == "ru") {
          dir = ru;
        } else if (direction == "dr") {
          dir = dr;
        } else if (direction == "rd") {
          dir = rd;
        } else if (direction == "x") {
          dir = r;
        } else if (direction == "y") {
          dir = u;
        } else {
          Serial.println("Invalid Direction Supplied.");
        }

        mve(dir, distance);  // Call mve with parsed direction and distance
      } else {
        Serial.println("Invalid format for 'move'. Use: move <dir> <dst>");
      }
    }
    else if (cmd == "mvet") {
      // Parse direction and distance from data
      int spaceIndex = data.indexOf(' ');

      if (spaceIndex != -1) {
        String direction = data.substring(0, spaceIndex);       // Get x value (before space)
        int tlength = data.substring(spaceIndex + 1).toInt();      // Get y value (after space)
        bool* dir = nullptr;
        direction.toLowerCase();
        
        if (direction == "l") {
          dir = l;
        } else if (direction == "r") {
          dir = r;
        } else if (direction == "u") {
          dir = u;
        } else if (direction == "d") {
          dir = d;
        } else if (direction == "ld") {
          dir = ld;
        } else if (direction == "dl") {
          dir = dl;
        } else if (direction == "lu") {
          dir = lu;
        } else if (direction == "ul") {
          dir = ul;
        } else if (direction == "ur") {
          dir = ur;
        } else if (direction == "ru") {
          dir = ru;
        } else if (direction == "dr") {
          dir = dr;
        } else if (direction == "rd") {
          dir = rd;
        } else if (direction == "x") {
          dir = r;
        } else if (direction == "y") {
          dir = u;
        } else {
          Serial.println("Invalid Direction Supplied.");
        }

        moveTime(dir, tlength);  // Call mve with parsed direction and distance
      } else {
        Serial.println("Invalid format for 'movetime'. Use: movetime <dir> <len>");
      }
    }
    else {
      Serial.println("Invalid option entered.");
    }

    resetBEDPins();
  } 
}
 
void hold (int holdtimes) {
  for (i = 0; i<(2*holdtimes); i++) {
    delayMicroseconds(delayTime);
  }
}

void setSpeed (int delaytime) {
    if (delaytime < 500) {
    delaytime = 500;
  }
  delayTime = delaytime;
}
void setFrequency (float frequency) {
  setSpeed(delayFromFrequency(frequency));
}

unsigned int delayFromFrequency(float frequencyHz) {
  // Clamp frequency to maximum of 1000 Hz
  if (frequencyHz > 1000.0) frequencyHz = 1000.0;
  if (frequencyHz <= 0) return 0; // avoid divide by zero

  // Compute delay time per half-step in microseconds
  return (unsigned int)(1000000.0 / (2.0 * frequencyHz));
}

void getSpeed () {
  String positionStr = String("Speed: " + delayTime);
  Serial.println(positionStr);
}

void step(bool dir[]) {

  if (!dir[0]) { // if only one motor is addressed
    if (!dir[1]) { // X axis
      digitalWrite(dirX, dir[2]);
      digitalWrite(stpX, HIGH);
      delayMicroseconds(delayTime-16);
      digitalWrite(stpX, LOW);
      delayMicroseconds(delayTime-16);
      if (dir[2]) {
        pos[x]++;
      } else {
        pos[x]--;
      }
    } else { // Y axis
      digitalWrite(dirY, dir[2]);
      delayMicroseconds(delayTime-16);
      digitalWrite(stpY, HIGH);
      delayMicroseconds(delayTime-16);
      digitalWrite(stpY, LOW);
      if (dir[2]) {
        pos[y]++;
      } else {
        pos[y]--;
      }
    }
  } else { // if both motors addressed
      digitalWrite(dirX, dir[1]);
      digitalWrite(stpX, HIGH);
      delayMicroseconds(delayTime-24);
      digitalWrite(stpX, LOW);
      digitalWrite(dirY, dir[2]);
      digitalWrite(stpY, HIGH);
      delayMicroseconds(delayTime-24);
      digitalWrite(stpY, LOW);

      if (dir[1]) {
        pos[x]++;
      } else {
        pos[x]--;
      }
      if (dir[2]) {
        pos[y]++;
      } else {
        pos[y]--;
      }
  }
}

// move l -20

void mve(bool dir[], int count) {
  
  if (count > 0) {
    for (i = 0; i<count; i++) {
      step(dir);
    }
  } else if (count < 0) {
     bool temp[3] = { dir[0], dir[1], dir[2] };
    if (dir[0] == LOW) {
      temp[2] = !dir[2];
    } else {
      temp[1] = !dir[1];
      temp[2] = !dir[2];
    }
    for (i = 0; i<(-count); i++) {
      step(temp);
    }
  }
}

void moveTime(bool dir[], unsigned long tlength_ms) {

  if (delayTime == 0) return;  // safety

  // Convert total move time to microseconds
  unsigned long totalTime_us = tlength_ms * 1000UL;

  // Time per full step (HIGH + LOW)
  unsigned long stepTime_us = 2UL * delayTime;

  // Number of whole steps we can perform
  unsigned long steps = totalTime_us / stepTime_us;

  for (unsigned long k = 0; k < steps; k++) {
    step(dir);
  }
}

void samsung() {

  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(r, 150);
  delay(150);
  setFrequency(440);
  moveTime(r, 150);
  delay(150);
  setFrequency(554);
  moveTime(u, 150);
  delay(150);
  setFrequency(554);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(ur, 300);
  delay(300);
  
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 300);
  delay(150);
  
  moveTime(u, 150);
  setFrequency(494);
  moveTime(u, 150);
  setFrequency(440);
  moveTime(u, 150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(369);
  moveTime(u, 150);
  setFrequency(329);
  moveTime(u, 600);
  delay(300);


  
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(554);
  moveTime(u, 150);
  delay(150);
  setFrequency(554);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 300);
  delay(300);
  
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 300);
  setFrequency(369);
  moveTime(u, 150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(311);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 600);
  delay(300);
  
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(369);
  moveTime(u, 150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(440);
  moveTime(u, 300);
  delay(300);
  
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(587);
  moveTime(u, 150);
  setFrequency(493);
  moveTime(u, 150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(440);
  moveTime(u, 600);
  delay(300);

  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(369);
  moveTime(u, 150);
  delay(150);
  setFrequency(369);
  moveTime(u, 150);
  delay(150);
  setFrequency(369);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(440);
  moveTime(u, 300);
  delay(300);

  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 300);
  delay(150);
  
  moveTime(u, 150);
  setFrequency(494);
  moveTime(u, 300);
  setFrequency(415);
  moveTime(u, 300);
  setFrequency(440);
  moveTime(u, 600);
  delay(300);

  setFrequency(440);
  moveTime(u, 150);
  delay(150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(369);
  moveTime(u, 150);
  setFrequency(369);
  moveTime(u, 150);
  delay(150);
  setFrequency(369);
  moveTime(u, 150);
  setFrequency(440);
  moveTime(u, 150);
  setFrequency(415);
  moveTime(u, 150);
  setFrequency(494);
  moveTime(u, 150);
  setFrequency(440);
  moveTime(u, 300);
  delay(300);

  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 150);
  delay(150);
  setFrequency(329);
  moveTime(u, 300);
  delay(150);
  
  moveTime(u, 150);
  setFrequency(494);
  moveTime(u, 300);
  setFrequency(415);
  moveTime(u, 300);
  setFrequency(440);
  moveTime(u, 600);
  delay(400);

  setFrequency(554);
  moveTime(u, 366);
  setFrequency(659);
  moveTime(u, 200);
  setFrequency(494);
  moveTime(u, 200);
  setFrequency(554);
  moveTime(u, 200);
  setFrequency(440);
  moveTime(u, 200);
  setFrequency(369);
  moveTime(u, 400);

  
}

/*
 //                  xDir  yDir
bool ur[4] = {HIGH, HIGH, HIGH};

 */

void goTo(int xPos, int yPos) {

  int dx = xPos - pos[x];
  int dy = yPos - pos[y];

  int absDx = abs(dx);
  int absDy = abs(dy);

  int diagSteps = min(absDx, absDy);
  int straightSteps = max(absDx, absDy) - diagSteps;

  // ---- Diagonal Move ----
  if (diagSteps > 0) {
    bool diag[3] = {HIGH, dx > 0, dy > 0};
    mve(diag, diagSteps);
  }

  // ---- Straight Move ----
  if (straightSteps > 0) {

    bool straight[3];

    if (absDx > absDy) {
      // move X only
      straight[0] = LOW;
      straight[1] = LOW;          // X axis
      straight[2] = dx > 0;       // direction
    } else {
      // move Y only
      straight[0] = LOW;
      straight[1] = HIGH;         // Y axis
      straight[2] = dy > 0;       // direction
    }

    mve(straight, straightSteps);
  }
}

void traverseBoard (bool dir[], int holdTime) {
  for(j=0; j<7; j++) {
    mve(dir, 200);
    delay(holdTime);
  }
  getPos();
}

void moveDownLevel (int holdTime) {
  mve(d, 200);
  delay(holdTime);
  getPos();
}

void getPos () {
  String positionStr = String("Position: X = " + pos[x]) + ", Y = " + String(pos[y]);
  Serial.println(positionStr);
}



void demo () {
  
  Serial.println("Demo");
  
  goTo(0,0);
  int holdTime = 500;
  traverseBoard(r, holdTime);
  moveDownLevel(holdTime);
  traverseBoard(l, holdTime);
  moveDownLevel(holdTime);
  traverseBoard(r, holdTime);
  moveDownLevel(holdTime);
  traverseBoard(l, holdTime);
  moveDownLevel(holdTime);
  traverseBoard(r, holdTime);
  goTo(0,0);
  
}



void motorTest () {
  Serial.println("Simple Motor Movement Test");

  //Tests possible combinations of x-y axis movement
    
  Serial.println(" - Testing X axis movement");

    mve(r, 500);
    delay(400);
    mve(l, 500);
    delay(400);
      
  Serial.println(" - Testing Y axis movement");
  
    mve(u, 500);
    delay(400);
    mve(d, 500);
    delay(400);

  Serial.println(" - Testing in-phase dual motor movement");

    mve(ur, 500);
    delay(400);
    mve(dl, 500);
    delay(400);

  Serial.println(" - Testing out-of-phase dual motor movement");
    
    mve(ul, 500);
    delay(400);
    mve(dr, 500);

  Serial.println("Testing Complete.");
    
}
