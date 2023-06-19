// libraries for the project
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include "Secrets.h"
#include <WiFiUdp.h>
#include <NTPClient.h>


WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

//  date and time variables
String Time = "";
int h = 0;
int m = 0;
int s = 0;
String Date = "";
int y = 0;
int mn = 0;
int d = 0;

//  ultrasonic sensor variables
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

//  aws iot core topic for MQTT calls
#define AWS_IOT_PUBLISH_TOPIC   "esp8266/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp8266/sub"

WiFiClientSecure net;

// converting the signatures for execution
BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey pkey(privkey);

PubSubClient client(net);

time_t now;
time_t nowish = 1510592825;

//  getting time informations
void NTPConnect(void)
{
  Serial.print("Setting time using SNTP");
  configTime(TIME_ZONE * 3600, 0 * 3600, "pool.ntp.org", "time.nist.gov");
  now = time(nullptr);
  while (now < nowish)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("done!");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));
}


// message from the aws iot core while subscribing the topic
void messageReceived(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}


//       connecting to the wifi network
//   and aws iot core through MQTT protocol
void connectAWS()
{
  delay(3000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.println(String("Attempting to connect to SSID: ") + String(WIFI_SSID));

  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }

  NTPConnect();

  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &pkey);

  client.setServer(MQTT_HOST, 8883);
  client.setCallback(messageReceived);


  Serial.println("Connecting to AWS IOT");

  while (!client.connect(THINGNAME))
  {
    Serial.print(".");
    delay(1000);
  }

  if (!client.connected()) {
    Serial.println("AWS IoT Timeout!");
    return;
  }
  // Subscribe to a topic
  int mm = client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
  Serial.println(mm);
  Serial.println("AWS IoT Connected!");
}


//    function to measure the distance from the ultrasonic sensor
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


//    publishing the time, date and distance to the aws iot core through MQTT protocol
void publishMessage()
{
  StaticJsonDocument<200> doc;
  doc["year"] = int(y);
  doc["month"] = int(m);
  doc["day"] = int(d);
  doc["hours"] = int(h);
  doc["minutes"] = int(mn);
  doc["seconds"] = int(s);
  doc["time"] = String(Time);
  doc["date"] = String(Date);
  doc["distance"] = int(bin_lvl);
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); // print to client

  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}


//    measuring the right time and date from NTP server
void T(){
  timeClient.update();
  time_t epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime ((time_t *)&epochTime);
  d = ptm->tm_mday;
  m = ptm->tm_mon+1;
  y = ptm->tm_year+1900;
  Date += (String)d + "-";
  Date += (String)m + "-";
  Date += (String)y;
  Serial.println(Date);
  h = timeClient.getHours();
  mn = timeClient.getMinutes();
  s = timeClient.getSeconds();
  Time += (String)h + ":";
  Time += (String)mn + ":";
  Time += (String)s;
  Serial.println(Time);
  delay(100);
}


//    setting up code for the non-looping main method
//              execution starts here
void setup()
{
  Serial.begin(9600);
  timeClient.begin();
  connectAWS();
  pinMode(D4, OUTPUT);
  pinMode(trigger, OUTPUT);
  pinMode(echo, INPUT);
}


//    continuous looping main method 
//        executed contiuosly
void loop()
{
  digitalWrite(D4, HIGH);
  delay(1000);
  digitalWrite(D4, LOW);
  delay(1000);


  measure();

  Serial.print("Bin lvl = ");
  Serial.print(bin_lvl);
  Serial.print("%");
  Serial.println();
  delay(100);
  T();
  

  now = time(nullptr);

//  continuously checking if wifi and aws connected
  if (!client.connected())
  {
    connectAWS();
  }
  else
  {
    client.loop();
    //  checking the bin level and updates the state only when bin level changes
    if (check != bin_lvl)
    {
      publishMessage();
      check = bin_lvl;
    }
  }

//  time and date updated as they are added continuosly to the previous state
  Time = "";
  Date = "";
}