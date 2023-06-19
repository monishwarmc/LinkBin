// importing the reuired libraries
#include <ESP8266WiFi.h>
#include "ThingSpeak.h"


 // your network SSID (name)
const char* ssid = "*********";  
// your network password 
const char* password = "********";   

WiFiClient  client;

//  channel number of the thingspeak channel
unsigned long myChannelNumber = ********;
//        Thingspeak write API key
const char * myWriteAPIKey = "***************";


//    ultrasonic variables
const int trigger = 14;
const int echo = 12;
long t;
int x;
int i;
int distanceCM;
int resultCM;
int binHeight = 30;
int bin_lvl = 0;
int check = 0;
int lvl = 0;


//    measuring function of the ultrasonic sensor
void measure()
  {
    delay(100);
    digitalWrite(trigger, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigger, LOW);
    t = pulseIn(echo, HIGH);
    distanceCM = t * 0.034;
    resultCM = distanceCM / 2;

    bin_lvl = map(resultCM, 3, binHeight, 100, 0);
    if (bin_lvl > 100) bin_lvl = 100;
    if (bin_lvl < 0) bin_lvl = 0;
  }


//    code set up for initialization
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(D4, OUTPUT);
  pinMode(trigger, OUTPUT);
  pinMode(echo, INPUT);
  
  WiFi.mode(WIFI_STA);   
  
  ThingSpeak.begin(client);
}

//    code to be run every time the sketch is run
void loop() {
  digitalWrite(D4, HIGH);
  delay(1000);
  digitalWrite(D4, LOW);
  delay(1000);

//  continuous checking of WIFI connection
  if(WiFi.status() != WL_CONNECTED)
  {
    Serial.print("Attempting to connect");
    while(WiFi.status() != WL_CONNECTED){
      WiFi.begin(ssid, password); 
      delay(5000);     
    } 
    Serial.println("\nConnected.");
  }
  
  Serial.println(bin_lvl);

  measure();

//    checkin g and updating everytime if the bin level changes
  if(check != bin_lvl){
    ThingSpeak.setField(1, bin_lvl);
  int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
  
  if(x == 200){
    Serial.println("Channel update successful.");
  }
  else{
    Serial.println("Problem updating channel. HTTP error code " + String(x));
  }
  delay(15000);
  check = bin_lvl;
  }
}
