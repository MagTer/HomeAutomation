using System.Net;
using System.Net.Http;
using AcControl.Resources;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AcControl.Resources
{
    class ForeCastManager
    {
        static readonly HttpClient client = new HttpClient();
        internal TemperatureObject GetAdjustedValue(ILogger log, TemperatureObject myTemp)
        {
            // HttpResponseMessage webResponse = client.GetAsync("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/16.754971/lat/60.597103/data.json");
            // webResponse.EnsureSuccessStatusCode();
            // string responseBody = await webResponse.Content.ReadAsStringAsync();
            // var weatherDData =  JsonSerializer.Deserialize(responseBody);
            log.LogInformation("Forecast temp return value: " + myTemp.ACTarget);
            return myTemp;

            // myTemp.WindDirection = (float)weatherDData.SelectToken("$.timeSeries[0].parameters[13].values[0]");
            // myTemp.WindSpeed = (float)weatherDData.SelectToken("$.timeSeries[0].parameters[14].values[0]");
            // myTemp.WindGust = (float)weatherDData.SelectToken("$.timeSeries[0].parameters[17].values[0]");
            // float tempNow = (float)weatherDData.SelectToken("$.timeSeries[0].parameters[11].values[0]");
            // float tempForecast = (float)weatherDData.SelectToken("$.timeSeries[3].parameters[11].values[0]");
            // myTemp.ForecastTempDiff = tempForecast - tempNow;
            // if ((myTemp.ForecastTempDiff < myTemp.ForecastTempDiffLimit) || (myTemp.WindGust > myTemp.WindLimit)) myTemp.ACTarget += 0.5f;
            

        }
    }
}
