# HomeAutomation
This repository contains my projects related to home automation.
Sharing it mostly to learn about github, repositories and as a backup :)

## AcControl
A simple API I use to determin the target temperature of my Daikin heat pump.
It takes the temperature reading of a indoor and outdoor sensor and calculates a suitable target for my house.

It also queries a weather forcasting service to check if it will be windy and adjusts the target slightly.


## HomeyScript
Javascript based scripts to control functions in my Homey. 
One for reaching out to the above AcControl API and one for checking for stale devices.
