#include <WiFiSettingsService.h>

WiFiSettingsService::WiFiSettingsService(AsyncWebServer* server, FS* fs, SecurityManager* securityManager) : AdminSettingsService(server, fs, securityManager, WIFI_SETTINGS_SERVICE_PATH, WIFI_SETTINGS_FILE) {}

WiFiSettingsService::~WiFiSettingsService() {}

void WiFiSettingsService::begin() {
  SettingsService::begin();
  reconfigureWiFiConnection();
}

void WiFiSettingsService::readFromJsonObject(JsonObject& root){
    _ssid = root["ssid"] | "";
    _password = root["password"] | "";
    _hostname = root["hostname"] | "";
    _staticIPConfig = root["static_ip_config"] | false;

    // extended settings
    readIP(root, "local_ip", _localIP);
    readIP(root, "gateway_ip", _gatewayIP);
    readIP(root, "subnet_mask", _subnetMask);
    readIP(root, "dns_ip_1", _dnsIP1);
    readIP(root, "dns_ip_2", _dnsIP2);

    // Swap around the dns servers if 2 is populated but 1 is not
    if (_dnsIP1 == INADDR_NONE && _dnsIP2 != INADDR_NONE){
      _dnsIP1 = _dnsIP2;
      _dnsIP2 = INADDR_NONE;
    }

    // Turning off static ip config if we don't meet the minimum requirements
    // of ipAddress, gateway and subnet. This may change to static ip only
    // as sensible defaults can be assumed for gateway and subnet
    if (_staticIPConfig && (_localIP == INADDR_NONE || _gatewayIP == INADDR_NONE || _subnetMask == INADDR_NONE)){
      _staticIPConfig = false;
    }
}

void WiFiSettingsService::writeToJsonObject(JsonObject& root){
      // connection settings
      root["ssid"] = _ssid;
      root["password"] = _password;
      root["hostname"] = _hostname;
      root["static_ip_config"] = _staticIPConfig;

      // extended settings
      writeIP(root, "local_ip", _localIP);
      writeIP(root, "gateway_ip", _gatewayIP);
      writeIP(root, "subnet_mask", _subnetMask);
      writeIP(root, "dns_ip_1", _dnsIP1);
      writeIP(root, "dns_ip_2", _dnsIP2);
}

void WiFiSettingsService::onConfigUpdated() {
  reconfigureWiFiConnection();
}

void WiFiSettingsService::reconfigureWiFiConnection() {
    Serial.println("Reconfiguring WiFi...");

    // disconnect and de-configure wifi and software access point
    WiFi.disconnect(true);

    // configure for static IP
    if (_staticIPConfig) {
      WiFi.config(_localIP, _gatewayIP,  _subnetMask, _dnsIP1, _dnsIP2);
    } else { 
     // configure for DHCP
#if defined(ESP8266) 
      WiFi.config(INADDR_ANY, INADDR_ANY, INADDR_ANY);
      WiFi.hostname(_hostname);
#elif defined(ESP_PLATFORM)
      WiFi.config(INADDR_NONE, INADDR_NONE, INADDR_NONE);
      WiFi.setHostname(_hostname.c_str());
#endif
    }

    // connect to the network
    WiFi.begin(_ssid.c_str(), _password.c_str());
}

void WiFiSettingsService::readIP(JsonObject& root, String key, IPAddress& _ip){
  if (!root[key].is<String>() || !_ip.fromString(root[key].as<String>())){
    _ip = INADDR_NONE;
  }
}

void WiFiSettingsService::writeIP(JsonObject& root, String key, IPAddress& _ip){
  if (_ip != INADDR_NONE){
    root[key] = _ip.toString();
  }
}
