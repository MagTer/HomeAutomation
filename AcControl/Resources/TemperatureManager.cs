using System.Net;
using System;
using AcControl.Resources;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;


namespace AcControl.Resources
{
    class TemperatureManager
    {
        internal TemperatureObject GetTempCalculation(ILogger log, TemperatureObject myTemp)
        {
           if (myTemp.RoomTarget == 0) myTemp.RoomTarget = 22f;
            myTemp = GetBaseTemperature(log, myTemp);
            myTemp = GetAdjustedTemperature(log, myTemp);
            return myTemp;
        }


        private TemperatureObject GetBaseTemperature(ILogger log, TemperatureObject myTemp)
        {
            float modifier = (myTemp.OutdoorTemp - myTemp.OutdoorRangeMin) / (myTemp.OutdoorRangeMax - myTemp.OutdoorRangeMin);
            if (modifier > 1) modifier = 1;
            if (modifier < 0) modifier = 0;
            modifier = 1 - modifier;
            myTemp.ACTarget = (modifier * (myTemp.ACTargetMax - myTemp.ACTargetMin) + myTemp.ACTargetMin);
            log.LogInformation("Initial temp based on outdoor sensor: " + myTemp.ACTarget);
            return myTemp;
        }

        private TemperatureObject GetAdjustedTemperature(ILogger log, TemperatureObject myTemp)
        {
            float modifier = (myTemp.IndoorTemp - myTemp.RoomTargetMin) / (myTemp.RoomTargetMax - myTemp.RoomTargetMin);
            if (modifier > 1) modifier = 1;
            if (modifier < 0) modifier = 0;
            myTemp.ACTarget = myTemp.ACTarget + ((0.5f - modifier) * 2f);
            log.LogInformation("Adjusted temp based on indoor sensor: " + myTemp.ACTarget);
            return myTemp;
        }


        internal TemperatureObject GetFinalizedOutput(ILogger log, TemperatureObject myTemp)
        {
            decimal decimalInput = new decimal(myTemp.ACTarget);
            double responseValue = Math.Round((double)decimalInput * 2, MidpointRounding.AwayFromZero) / 2;
            if (responseValue < myTemp.ACTargetMin) responseValue = myTemp.ACTargetMin;
            if (responseValue > myTemp.ACTargetMax) responseValue = myTemp.ACTargetMax;
            myTemp.ACTarget = (float)responseValue;
            log.LogInformation("Finalized return value: " + myTemp.ACTarget);
            return myTemp;
        }
    }
}
