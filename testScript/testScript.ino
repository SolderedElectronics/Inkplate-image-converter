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

    display.selectDisplayMode(INKPLATE_3BIT);
    display.drawBitmap3Bit(0, 0, a, a_w, a_h);
    display.display();

    delay(5000);
}