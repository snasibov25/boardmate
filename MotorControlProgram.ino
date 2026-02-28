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
bool u = HIGH;
bool d = LOW;
bool l = LOW;
bool r = HIGH;
int pos[2] = {0, 0};

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
  
  resetBEDPins(); //Set step, direction, microstep and enable pins to default states
  Serial.begin(9600);
  Serial.println("Motor Control Program v0.2");
  Serial.println("");
  Serial.println("Enter Control Option:");
  Serial.println("    1: Demo 2 Code - XY Movement");
  Serial.println("    2: Simple Dual Motor Movement Test");
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
