#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Configuration Wi-Fi
const char* ssid = "";
const char* password = "";

// Adresse du serveur API
const char* serverUrl = "http://x.x.x.x:5000/api/status"; // À adapter

// Pins
#define IR_SENSOR_PIN 34
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String lastStatus = "";

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(IR_SENSOR_PIN, INPUT);

  // Init écran OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("Échec OLED"));
    while (true);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Connexion Wi-Fi...");
  display.display();

  // Connexion Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Connecté !");
  display.display();
  delay(1000);
}

void loop() {
  static unsigned long lastSendTime = 0;
  const unsigned long sendInterval = 5000; // 5 secondes

  int irValue = digitalRead(IR_SENSOR_PIN);
  String status = (irValue == LOW) ? "OK" : "NONE";

  unsigned long currentTime = millis();

  // Envoie s’il y a un changement ou si le délai est passé
  if (status != lastStatus || currentTime - lastSendTime >= sendInterval) {
    sendStatusToServer(status);
    lastStatus = status;
    lastSendTime = currentTime;

    // Affichage OLED
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(0, 20);
    display.println("Etat:");
    display.println(status);
    display.display();
  }

  delay(200); // boucle rapide pour lecture capteur
}


void sendStatusToServer(String status) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"status\":\"" + status + "\"}";
    int httpResponseCode = http.POST(json);

    Serial.print("Code réponse: ");
    Serial.println(httpResponseCode);
    http.end();
  } else {
    Serial.println("Non connecté au WiFi");
  }
}
