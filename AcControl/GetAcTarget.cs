using System.Net;
using AcControl.Resources;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace AcControl
{
    public class GetAcTarget
    {
        private readonly ILogger _logger;

        public GetAcTarget(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<GetAcTarget>();
        }

        [Function("GetAcTarget")]
        public HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            TemperatureObject myTemp = new TemperatureObject(req);
            _logger.LogInformation("Inputs - inside:  " + myTemp.IndoorTemp + " - outside: " + myTemp.OutdoorTemp + " - target: " + myTemp.RoomTarget);

            if (myTemp.IndoorTemp == 0) { 
                var badResponse = req.CreateResponse(HttpStatusCode.OK);
                badResponse.Headers.Add("Content-Type", "text/plain; charset=utf-8");
                badResponse.WriteString("Please pass temperature parameters \"inside\",\"outside\" and \"target\"on the query string");
                return badResponse;
            }

            if (myTemp.RoomTarget == 0) myTemp.RoomTarget = 22f;

            TemperatureManager tempManager = new TemperatureManager();
            myTemp = tempManager.GetTempCalculation(_logger, myTemp);
 
            TibberManager Tibber = new TibberManager();
            myTemp = Tibber.GetAdjustedValue(_logger, myTemp);

            ForeCastManager SMHI = new ForeCastManager();
            myTemp = SMHI.GetAdjustedValue(_logger, myTemp);

            myTemp = tempManager.GetFinalizedOutput(_logger, myTemp);

            string responseString = "{\"Temperature\":\"" + myTemp.ACTarget + "\"}";
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "text/json; charset=utf-8");
            response.WriteString(responseString);
            return response;
        }
    }
}

