using System.Net;
using AcControl.Resources;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace AcControl.Resources
{
    class TibberManager
    {
        internal TemperatureObject GetAdjustedValue(ILogger log, TemperatureObject myTemp)
        {
            myTemp.ACTarget = myTemp.ACTarget - 0.1f;
            log.LogInformation("Tibber temp return value: " + myTemp.ACTarget);
            return myTemp;
        }
    }
}
