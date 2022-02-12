using System.Net;
using AcControl.Resources;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

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
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
        {
            TemperatureObject myTemp = new TemperatureObject(req);
            _logger.LogInformation("Inputs - inside:  " + myTemp.IndoorTemp + " - outside: " + myTemp.OutdoorTemp + " - target: " + myTemp.RoomTarget);

            if (myTemp.IndoorTemp == 0) { return CreateHttpResponse(req, false, "Please pass temperature parameters \"inside\",\"outside\" and \"target\"on the query string"); }

            TemperatureManager tempManager = new TemperatureManager();
            myTemp = tempManager.GetTempCalculation(_logger, myTemp);
 
            TibberManager Tibber = new TibberManager();
            myTemp = Tibber.GetAdjustedValue(_logger, myTemp);

            ForeCastManager SMHI = new ForeCastManager();
            myTemp = await SMHI.GetAdjustedValue(_logger, myTemp);

            myTemp = tempManager.GetFinalizedOutput(_logger, myTemp);

            return CreateHttpResponse(req, true, myTemp.ACTarget.ToString());
        }

        private static HttpResponseData CreateHttpResponse(HttpRequestData req, bool isjsonResponseType, string responseData)
        {
            var response = req.CreateResponse(HttpStatusCode.OK);
            string contentType = isjsonResponseType ? "text/json; charset=utf-8" : "text/plain; charset=utf-8";
            if (isjsonResponseType) { responseData = "{\"Temperature\":\"" + responseData + "\"}"; }
            response.Headers.Add("Content-Type", contentType);
            response.WriteString(responseData);
            return response;
        }
    }
}

