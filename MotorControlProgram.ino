#define stpX 2
#define dirX 3
#define stpY 8
#define dirY 9
#define MS1 4
#define MS2 5
#define MS3 6
#define EN 7
#define keepAlivePin 12


//Declare variables for functions
char user_input;
int i;
int j;
int state;
int x = 0;
int y = 1;
bool u = HIGH;
bool d = LOW;
bool l = LOW;
bool r = HIGH;
int pos[2] = {0, 0};

//dual button pin declaration
const int button1 = A0;  // SIG1
const int button2 = A1;  // SIG2

//emergency stop 
const int emergencyReset = SCL; 

//keeping power bank on
const unsigned long pulseInterval = 3000; // pulse every 3 seconds
const unsigned long pulseLength = 200;    // pulse duration in ms

unsigned long lastPulseTime = 0;
bool pulseState = LOW;


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
  pinMode(keepAlivePin, OUTPUT);
  

  //assigning input to buttons
  pinMode(button1, INPUT);
  pinMode(button2, INPUT);

  pinMode(emergencyReset, INPUT_PULLUP);  // connect button to GND

  
  resetBEDPins(); //Set step, direction, microstep and enable pins to default states
  Serial.begin(9600);
  Serial.println("Motor Control Program v0.2");
  Serial.println("");
  Serial.println("Enter Control Option:");
  Serial.println("    1: Demo 2 Code - XY Movement: Press Green");
  Serial.println("    2: Simple Dual Motor Movement Test: Press Red");
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
  if (digitalRead(emergencyReset) == LOW) {
      resetBEDPins();          // disable motors immediately
      asm volatile ("jmp 0");  // software reset (restarts Arduino)
  } 



  int state1 = digitalRead(button1);
  int state2 = digitalRead(button2);

  //this 4 lines keeps the powerbank from turning off by pulsing a digital signal
  unsigned long currentMillis = millis();

  // Check if it's time to pulse
  if (!pulseState && currentMillis - lastPulseTime >= pulseInterval) {
    digitalWrite(keepAlivePin, HIGH);  // start pulse
    pulseState = true;
    lastPulseTime = currentMillis;
  }

  // Check if pulse duration elapsed
  if (pulseState && currentMillis - lastPulseTime >= pulseLength) {
    digitalWrite(keepAlivePin, LOW);   // end pulse
    pulseState = false;
    lastPulseTime = currentMillis;
  }

  if (state1 == LOW) {
    
    
    digitalWrite(EN, LOW);   // enable motors
    Serial.println("Button 1 pressed");
    demo();
    resetBEDPins();

    while(digitalRead(button1) == LOW) {
      delay(10); }
  }

  if (state2 == LOW) {
    
    digitalWrite(EN, LOW);   // enable motors
    motorTest();
    Serial.println("Button 2 pressed");
    resetBEDPins();

    while(digitalRead(button2) == LOW) {
      delay(10); }
  }
  
  
  while(Serial.available()){
    user_input = Serial.read(); //Read user input and trigger appropriate function
    digitalWrite(EN, LOW); //Pull enable pin low to set FETs active and allow motor control
    if (user_input =='1') {
      demo();
    } else if(user_input =='2') {
      motorTest();
    } else {
      Serial.println("Invalid option entered.");
    }
    resetBEDPins();
  } 
}

void ds() {                // Sets the small delay time between HIGH and LOW and between steps
  delayMicroseconds(500); // CANNOT BE SMALLER THAN 500 MICROSECONDS
}
  
/*
 * Motor needs a delay of at least 500 microseconds between high and low in order to step.
 * 
 * When running a motor with the step() function, if inside a loop, a delay of 500 microseconds must be added 
 * unless running a step(x,?) and a step step(y,?) in the same loop.
 * 
 */

void step(int axis, bool dir) {
  if (axis == 0) {
    if (dir != digitalRead(dirX)) {
      digitalWrite(dirX, dir);
    }
    digitalWrite(stpX, HIGH);
    ds();
    digitalWrite(stpX, LOW);
    if (dir == HIGH) {
      pos[0] = pos[0] + 1;
    } else {
      pos[0] = pos[0] - 1;
    }
    
  } else {
    if (dir != digitalRead(dirY)) {
      digitalWrite(dirY, dir);
    }
    digitalWrite(stpY, HIGH);
    ds();
    digitalWrite(stpY, LOW);
    
    if (dir == HIGH) {
      pos[1] = pos[1] + 1;
    } else {
      pos[1] = pos[1] - 1;
    }
  }
  //Serial.print("X: ");
  //Serial.println(pos[0]);
  //Serial.print("Y: ");
  //Serial.println(pos[1]);
  
}

void goTo (int xPos, int yPos) {
  while (xPos != pos[0] || yPos != pos[1]) {
    if (pos[0] < xPos) {
      step(x,r);
    } else if (pos[0] > xPos) {
      step(x,l);
    } else {
      ds();
    }
    if (pos[1] < yPos) {
      step(y,r);
    } else if (pos[1] > yPos) {
      step(y,l);
    } else {
      ds();
    }
  }
}

void traverseBoard (bool dir, int holdTime) {
  for(j=0; j<7; j++) {
    for(i=0; i<200; i++) {
      step(x, dir);
      ds();
    }
    delay(holdTime);
  }
}

void moveDownLevel (int holdTime) {
  for(i=0; i<200; i++) {
    step(y, d);
    ds();
  }
  delay(holdTime);
}

void demo () {
  Serial.println("Demo");

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

    for(i=0; i<500; i++) {
      step(x,r);
      ds();
    }
    delay(400);
    for(i=0; i<500; i++) {
      step(x,l);
      ds();
    }
    delay(400);
      
  Serial.println(" - Testing Y axis movement");

    for(i=0; i<500; i++) {
      step(y,r);
      ds();
    }
    delay(400);
    for(i=0; i<500; i++) {
      step(y,l);
      ds();
    }
    delay(400);

  Serial.println(" - Testing in-phase dual motor movement");

    for(i=0; i<500; i++) {
      step(x,r);
      step(y,r);
    }
    delay(400);
    for(i=0; i<500; i++) {
      step(x,l);
      step(y,l);
    }
    delay(400);

  Serial.println(" - Testing out-of-phase dual motor movement");
    
    for(i=0; i<500; i++) {
      step(x,r);
      step(y,l);
    }
    delay(400);
    for(i=0; i<500; i++) {
      step(x,l);
      step(y,r);
    }

  Serial.println("Testing Complete.");
    
}
