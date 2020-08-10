#include "Inkplate.h"
#include "test.h"
#include "test2.h"

Inkplate display(INKPLATE_3BIT);

void setup() {
    Serial.begin(115200);

    display.begin();
    display.clearDisplay();
    display.clean();
}


void loop() {
    display.selectDisplayMode(INKPLATE_3BIT);
    display.drawBitmap3Bit(0, 0, test, 586, 600);
    display.display();

    delay(5000);

    display.selectDisplayMode(INKPLATE_1BIT);
    display.drawBitmap(0, 0, test2, test2_w, test2_h, BLACK, WHITE);
    display.display();

    delay(5000);
}