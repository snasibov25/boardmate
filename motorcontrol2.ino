//Declare pin functions on Arduino
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
int x;
int y;
int state;
void setup() {
pinMode(stpX, OUTPUT);
pinMode(dirX, OUTPUT);
pinMode(stpY, OUTPUT);
pinMode(dirY, OUTPUT);
pinMode(MS1, OUTPUT);
pinMode(MS2, OUTPUT);
pinMode(MS3, OUTPUT);
pinMode(EN, OUTPUT);
resetBEDPins(); //Set step, direction, microstep and enable pins to default states
Serial.begin(9600); //Open Serial connection for debugging
Serial.println("Begin motor control");
Serial.println();
//Print function list for user selection
Serial.println("Enter number for control option:");
Serial.println("1. Turn at default microstep mode.");
Serial.println("2. Reverse direction at default microstep mode.");
Serial.println("3. Turn at 1/16th microstep mode.");
Serial.println("4. Step forward and reverse directions.");
Serial.println();
}
//Main loop
void loop() {
while(Serial.available()){
user_input = Serial.read(); //Read user input and trigger appropriate function


digitalWrite(EN, LOW); //Pull enable pin low to set FETs active and allow motor control
//
//while(1){
//
//   switch (user_input) {
//      case l: { //move left 
//        
//        moveLeft();
//          }
//        break;
//  
//      case r : { //red and amber on
//        }
//        break;
//  
//  //you can also test for a range of values
//      case s: { // stop operation 
//        }
//        break;
//  
//      case 5 ... 14: { // all good - show green
//        }
//        break;
//  
//      case 15: { //bit high - show green and amber
//        }
//        break;
//  
//      default: 
//        // do nothing
//        
//  } 
//
//  
//}




if (user_input =='a')
{
moveLeft();
}
else if(user_input =='d')
{
moveRight();
}
else if(user_input =='3')
{
demoRIGHT();
}
else if(user_input =='4')
{
ForwardBackwardStep();
}
else
{
Serial.println("Invalid option entered.");
}
resetBEDPins();
}
}
//Reset Big Easy Driver pins to default states
void resetBEDPins()
{
digitalWrite(stpX, LOW);
digitalWrite(dirX, LOW);
digitalWrite(MS1, LOW);
digitalWrite(MS2, LOW);
digitalWrite(MS3, LOW);
digitalWrite(EN, HIGH);
}
//Default microstep mode function
void moveLeft()
{
  Serial.println("LEFT");
  digitalWrite(dirX, LOW); //Pull direction pin low to move "forward"

  int moveLeft = 1; 

  while(moveLeft == 1){
    digitalWrite(stpX,HIGH); //Trigger one step forward
    delay(1);
    digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again
    delay(1);
    char stop = Serial.read(); //Read user input and trigger appropriate function
    
}

//for(x= 0; x<1650; x++) //Loop the forward stepping enough times for motion to be visible
//{
//  digitalWrite(stpX,HIGH); //Trigger one step forward
//  delay(1);
//  digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again
//  delay(1);
//
//}
 

Serial.println("Enter new option");
Serial.println();

}

//70 cm whole board

//35 cm half way - equal to 1000 
void moveRight()
{
Serial.println("Moving forward at default step mode.");
digitalWrite(dirX, HIGH); //Pull direction pin low to move "right"


  int moveRight= 1; 

  while(moveRight == 1){
    digitalWrite(stpX,HIGH); //Trigger one step forward
    delay(1);
    digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again
    delay(1);

}

Serial.println("Enter new option");
Serial.println();

}





















void demoRIGHT ()
{
  int delayTime = 1000;
  Serial.println("DEMO");
  digitalWrite(dirX, HIGH); //Pull direction pin low to move "forward"
  digitalWrite(dirY, HIGH); //Pull direction pin low to move "forward"
 delay(delayTime);
for(y = 0; y<7; y++){
 
  for(x= 0; x<200; x++) //Loop the forward stepping enough times for motion to be visible
  {
  digitalWrite(stpX,HIGH); //Trigger one step forward
  digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again 
  delay(1);
  digitalWrite(stpY,HIGH); //Trigger one step forward
  digitalWrite(stpY,LOW); //Pull step pin low so it can be triggered again 
  delay(1);
  }

  delay(delayTime);

}

digitalWrite(dirX, LOW); //Pull direction pin low to move "left"
digitalWrite(dirY, LOW); //Pull direction pin low to move "left"
for(x= 0; x<700; x++) //Loop the forward stepping enough times for motion to be visible
  {
  digitalWrite(stpX,HIGH); //Trigger one step forward
  delay(1);
  digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again 
  delay(1);
  }
for(x= 0; x<700; x++) //Loop the forward stepping enough times for motion to be visible
  {

  digitalWrite(stpY,HIGH); //Trigger one step forward
  delay(1);
  digitalWrite(stpY,LOW); //Pull step pin low so it can be triggered again 
  delay(1);
  }


Serial.println("Enter new option");
Serial.println();

}


//Forward/reverse stepping function
void ForwardBackwardStep()
{
  Serial.println("Alternate between stepping forward and reverse.");
  for(x= 1; x<5; x++)  //Loop the forward stepping enough times for motion to be visible
  {
    //Read direction pin state and change it
    state=digitalRead(dirX);
    if(state == HIGH)
    {
      digitalWrite(dirX, LOW);
      digitalWrite(dirY, LOW);
    }
    else if(state ==LOW)
    {
      digitalWrite(dirX,HIGH);
      digitalWrite(dirY,HIGH);
    }

    for(y=0; y<1000; y++)
    {
      digitalWrite(stpX,HIGH); //Trigger one step
      digitalWrite(stpY,HIGH); //Trigger one step
      delay(1);
      digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again
      digitalWrite(stpY,LOW); //Pull step pin low so it can be triggered again
      delay(1);
    }
  }
  Serial.println("Enter new option");
  Serial.println();
}
//Reverse default microstep mode function
void ReverseStepDefault()
{
Serial.println("Moving in reverse at default step mode.");
digitalWrite(dirX, HIGH); //Pull direction pin high to move in "reverse"
for(x= 0; x<1000; x++) //Loop the stepping enough times for motion to be visible
{
digitalWrite(stpX,HIGH); //Trigger one step
delay(1);
digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again
delay(1);
}
Serial.println("Enter new option");
Serial.println();
}
// 1/16th microstep foward mode function
void SmallStepMode()
{
Serial.println("Stepping at 1/16th microstep mode.");
digitalWrite(dirX, LOW); //Pull direction pin low to move "forward"
digitalWrite(MS1, HIGH); //Pull MS1,MS2, and MS3 high to set logic to 1/16th microstep resolution
digitalWrite(MS2, HIGH);
digitalWrite(MS3, HIGH);
for(x= 0; x<1000; x++) //Loop the forward stepping enough times for motion to be visible
{
digitalWrite(stpX,HIGH); //Trigger one step forward
delay(1);
digitalWrite(stpX,LOW); //Pull step pin low so it can be triggered again
delay(1);
}
Serial.println("Enter new option");
Serial.println();
}
