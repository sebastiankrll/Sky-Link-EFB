#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jun  8 23:19:15 2023

@author: sebastian
"""

from dataclasses import dataclass
import math, csv
import numpy as np

@dataclass
class airport:
    altitude: int = 1400
    oat: int = 30
    qnh: int = 1013
    windSpeed: int = 10
    windDir: int = 232
    runwayLength: int = 2750
    runwayHeading: int = 232
    runwaySlope: float = 1.0
    runwayLengthCorrected: float = 0
    runwayConds: bool = False
    
@dataclass
class aircraft:
    weight: float = 66.0
    conf: int = 1
    airCon: bool = True
    antiIce: int = 0
    revOps: bool = True
    
def splitSpeeds(clustered):
    speeds = []
    for speed in clustered:
        temp = speed.split('/')
        speeds.append([int(temp[0]), int('1' + temp[1]), int('1' + temp[2])])
    return speeds

def getMaxWeight(conf):
    maxWeights = []
    for i in range(0, 3):
        output = []
        with open('qrt/conf' + str(conf) + '_' + str(i) + '000ft_weights.txt') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            for row in csv_reader:
                output.append(row)
            
        columns = np.transpose(output[1:])
        weights = []
        for weight in columns[1:]:
            weights.append(np.interp(airport.oat, columns[0].astype(float), weight.astype(float)))
            
        maxWeights.append(np.interp(airport.runwayLengthCorrected, output[0][1:], weights))
        
    return np.interp(airport.altitude, [0, 1000, 2000], maxWeights)
   
# Calculate corrected runway length 
wind = airport.windSpeed * math.cos(math.radians(airport.runwayHeading - airport.windDir))
if airport.runwaySlope > 0:
    airport.runwayLengthCorrected = airport.runwayLength + np.interp(airport.runwayLength, [1500, 3500], [6.5, 12.5]) * wind - np.interp(airport.runwayLength, [1500, 3500], [160, 600]) * airport.runwaySlope
else:
    airport.runwayLengthCorrected = airport.runwayLength + np.interp(airport.runwayLength, [1500, 3500], [6.5, 12.5]) * wind + np.interp(airport.runwayLength, [1500, 3500], [17, 67]) * airport.runwaySlope
    
# Interpolate over oat, runway length and altitude to get max weight
if aircraft.conf == 0:
    maxWeights = 0
    for i in range(1, 3):
        temp = getMaxWeight(i)
        if temp > maxWeights:
            maxWeight = temp
            maxWeights = temp
            aircraft.conf = i
else:
    maxWeight = getMaxWeight(aircraft.conf)

# Weight corrections corresponding to qnh, air con and anti ice operations
qnhTarget = airport.qnh
while qnhTarget != 1013:
    if qnhTarget > 1013:
        qnhTarget -= 1
        maxWeight += 0.02
    else:
        qnhTarget += 1
        maxWeight -= 0.09
        
if aircraft.antiIce == 1:
    maxWeight -= 0.25
    
if aircraft.antiIce == 2:
    maxWeight -= 0.75
    
if aircraft.airCon:
    maxWeight -= 2.2
    
# Weight corrections corresponding to runway conditions
if airport.runwayConds:
    if aircraft.revOps:
        if 2500 < airport.runwayLengthCorrected <= 3500:
            maxWeight -= 0.3
        if airport.runwayLengthCorrected > 3500:
            maxWeight -= 0.4
    else:
        if airport.runwayLengthCorrected <= 3500:
            maxWeight -= 1.0
        if airport.runwayLengthCorrected > 3500:
            maxWeight -= 0.8

if maxWeight <= aircraft.weight:
    vSpeeds = [0, 0, 0]
    flexTemp = 0
else:
    # With max weight setting interpolate over weight, runway length and altitude to get corresponding flex temp
    maxSpeeds = []
    maxTemps = []
    for i in range(0, 3):
        outputSpeeds = []
        outputWeights = []
        with open('qrt/conf1_' + str(i) + '000ft_weights.txt') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            for row in csv_reader:
                outputWeights.append(row)
                
        with open('qrt/conf1_' + str(i) + '000ft_speeds.txt') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            for row in csv_reader:
                outputSpeeds.append(row)
        
        interpolatedSpeeds = []
        interpolatedTemps = []
        columns = np.transpose(outputWeights[1:])
        for i, column in enumerate(columns[1:]):
            interpolatedTemps.append(np.interp(aircraft.weight, np.flip(column.astype(float)), np.flip(columns[0].astype(float))))
            speeds = np.transpose(splitSpeeds(np.transpose(outputSpeeds[1:])[1:][i]))
            temp = []
            for speed in speeds:
                temp.append(np.interp(aircraft.weight, np.flip(column.astype(float)), np.flip(speed)))
            interpolatedSpeeds.append(temp)
         
        lengths = outputWeights[0][1:]
        maxTemps.append(np.interp(airport.runwayLengthCorrected, lengths, interpolatedTemps))
        temp = []
        for speed in np.transpose(interpolatedSpeeds):
            temp.append(np.interp(airport.runwayLengthCorrected, lengths, speed))
            
        maxSpeeds.append(temp)
        
    # Flex corrections corresponding to qnh, air con and anti ice operations
    takeoffTemp = np.interp(airport.altitude, [0, 1000, 2000], maxTemps)
    qnhTarget = airport.qnh
    while qnhTarget != 1013:
        if qnhTarget > 1013:
            qnhTarget -= 1
            takeoffTemp += 1/40
        else:
            qnhTarget += 1
            takeoffTemp -= 1/6
            
    if aircraft.antiIce == 1:
        takeoffTemp -= 1
        
    if aircraft.antiIce == 2:
        takeoffTemp -= 2
        
    if aircraft.airCon:
        takeoffTemp -= 5
        
    # Flex corrections corresponding to runway conditions
    if airport.runwayConds:
        if aircraft.revOps:
            if airport.runwayLengthCorrected > 2500:
                takeoffTemp -= 1.0
        else:
            takeoffTemp -= 2.0
         
    maxSpeed = []
    for speed in np.transpose(maxSpeeds):
        maxSpeed.append(np.interp(airport.altitude, [0, 1000, 2000], speed))
        
    # Speeds corrections corresponding to runway conditions
    if airport.runwayConds:
        if aircraft.revOps:
            if airport.runwayLengthCorrected <= 2500:
                maxSpeed[0] -= 9
            if 2500 < airport.runwayLengthCorrected <= 3500:
                maxSpeed[0] -= 9
                maxSpeed[1] -= 1
                maxSpeed[2] -= 1
            if airport.runwayLengthCorrected > 3500:
                maxSpeed[0] -= 10
                maxSpeed[1] -= 2
                maxSpeed[2] -= 2
        else:
            if airport.runwayLengthCorrected <= 2500:
                maxSpeed[0] -= 14
                maxSpeed[1] -= 3
                maxSpeed[2] -= 3
            if 2500 < airport.runwayLengthCorrected <= 3500:
                maxSpeed[0] -= 15
                maxSpeed[1] -= 4
                maxSpeed[2] -= 4
            if airport.runwayLengthCorrected > 3500:
                maxSpeed[0] -= 14
                maxSpeed[1] -= 4
                maxSpeed[2] -= 4
    
    # Takeoff speeds and flex temp
    vSpeeds = np.ceil(maxSpeed).astype(int)
    flexTemp = max(np.floor(takeoffTemp).astype(int), airport.oat)
    
print(maxWeight)
print(aircraft.conf)
print(vSpeeds)
print(flexTemp)