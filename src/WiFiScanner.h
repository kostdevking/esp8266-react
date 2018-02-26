#ifndef WiFiScanner_h
#define WiFiScanner_h

#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <TimeLib.h>

class WiFiScanner {

  public:

    WiFiScanner(AsyncWebServer *server);

  private:

    AsyncWebServer* _server;

    void scanNetworks(AsyncWebServerRequest *request);
    void listNetworks(AsyncWebServerRequest *request);

};

#endif // end WiFiScanner_h
