#!/usr/bin/python
import RPi.GPIO as GPIO
import time
import datetime

#======config=======
pwmPin = 17
iterations_count = 5
#===================

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(pwmPin, GPIO.IN)

isHigh = False
th = tl = None
values = []
i = 0

while i < iterations_count + 1:
    val = GPIO.input(pwmPin)
    if val and isHigh == False:
        isHigh = True
        th = datetime.datetime.utcnow()
    if not val and isHigh == True:
        isHigh = False
        tl = datetime.datetime.utcnow()
    if th != None and tl != None:
        val = tl-th
        val = int(val.microseconds/1000)
        cppm = 2000 * (val - 2)/(1004 -4)
        values.append(cppm)
        i+=1
        th = tl = None

values = values[1:] #First value may be not trusted (when script was started in the middle of PWM signal) so delete it
ppm = int(sum(values) / len(values)) #get average value
print(ppm)