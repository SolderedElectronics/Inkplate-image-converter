#include "Inkplate.h"
#include "test4.h"
#include "test6.h"
#include "test7.h"
#include "test8.h"

Inkplate display(INKPLATE_3BIT);

void setup()
{
    Serial.begin(115200);

    display.begin();
    display.clearDisplay();
    display.clean();
}

void loop()
{
    display.clearDisplay();
    display.clean();

    display.selectDisplayMode(INKPLATE_1BIT);
    display.drawBitmap(0, 0, test4, test4_w, test4_h, BLACK, WHITE);
    display.display();

    delay(5000);

    display.clearDisplay();
    display.clean();

    display.selectDisplayMode(INKPLATE_3BIT);
    display.drawBitmap3Bit(0, 0, test6, test6_w, test6_h);
    display.display();

    delay(5000);

    display.clearDisplay();
    display.clean();

    display.selectDisplayMode(INKPLATE_1BIT);
    display.drawBitmap(0, 0, test7, test7_w, test7_h, BLACK, WHITE);
    display.display();

    delay(5000);
}