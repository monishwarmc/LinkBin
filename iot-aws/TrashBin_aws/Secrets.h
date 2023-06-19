#include <pgmspace.h>
 
#define SECRET

//wifi SSID or name
const char WIFI_SSID[] = "*********";   
//wifi password        
const char WIFI_PASSWORD[] = "********";           

//aws iot thing name
#define THINGNAME "LinkBin"

//UTC timezone
int8_t TIME_ZONE = 5.5;

//UTC offset 3600*5.5
int utcOffsetInSeconds = 19800;

//aws iot core endpoint for MQTT calls
const char MQTT_HOST[] = "a2r0p3cvxoeeko-ats.iot.us-east-1.amazonaws.com";
 

// aws iot core AmazonCA1 certificate signature
static const char cacert[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
*
*   
*
-----END CERTIFICATE-----
)EOF";
 
 
// aws iot core device certificate signature
static const char client_cert[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
*
*
*
-----END CERTIFICATE-----

 
)KEY";
 
 
// aws iot core private key signature
static const char privkey[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
*
*
*
-----END RSA PRIVATE KEY-----

 
)KEY";