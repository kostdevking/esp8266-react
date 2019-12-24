#ifndef OTASettingsService_h
#define OTASettingsService_h

#include <AdminSettingsService.h>

#ifdef ESP32
#include <ESPmDNS.h>
#elif defined(ESP8266)
#include <ESP8266mDNS.h>
#endif

#include <ArduinoOTA.h>
#include <WiFiUdp.h>

// Emergency defaults
#define DEFAULT_OTA_PORT 8266
#define DEFAULT_OTA_PASSWORD "esp-react"

#define OTA_SETTINGS_FILE "/config/otaSettings.json"
#define OTA_SETTINGS_SERVICE_PATH "/rest/otaSettings"

class OTASettingsService : public AdminSettingsService {
 public:
  OTASettingsService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager);
  ~OTASettingsService();

  void loop();

 protected:
  void onConfigUpdated();
  void readFromJsonObject(JsonObject& root);
  void writeToJsonObject(JsonObject& root);

 private:
  ArduinoOTAClass* _arduinoOTA;
  bool _enabled;
  int _port;
  String _password;

  void configureArduinoOTA();
#ifdef ESP32
  void onStationModeGotIP(WiFiEvent_t event, WiFiEventInfo_t info);
#elif defined(ESP8266)
  WiFiEventHandler _onStationModeGotIPHandler;
  void onStationModeGotIP(const WiFiEventStationModeGotIP& event);
#endif
};

#endif  // end OTASettingsService_h
