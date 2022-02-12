using System.Net;
using System.Net.Http;
using AcControl.Resources;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace AcControl.Resources
{
    class ForeCastManager
    {
        static readonly HttpClient client = new HttpClient();
        internal async Task<TemperatureObject> GetAdjustedValue(ILogger logger, TemperatureObject myTemp)
        {
            HttpResponseMessage webResponse = await client.GetAsync("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/16.754971/lat/60.597103/data.json");
            webResponse.EnsureSuccessStatusCode();
            string responseBody = await webResponse.Content.ReadAsStringAsync();
            using var responseBodyJdoc = JsonDocument.Parse(responseBody);

            JsonElement weatherData = responseBodyJdoc.RootElement;


            myTemp.WindDirection = GetValueFromForecastJSON(logger, weatherData.GetProperty("timeSeries")[0].GetProperty("parameters")[13]);
            myTemp.WindSpeed = GetValueFromForecastJSON(logger, weatherData.GetProperty("timeSeries")[0].GetProperty("parameters")[14]);
            myTemp.WindGust = GetValueFromForecastJSON(logger, weatherData.GetProperty("timeSeries")[0].GetProperty("parameters")[17]);
            float tempNow = GetValueFromForecastJSON(logger, weatherData.GetProperty("timeSeries")[0].GetProperty("parameters")[10]);
            float tempForecast = GetValueFromForecastJSON(logger, weatherData.GetProperty("timeSeries")[3].GetProperty("parameters")[10]);


            myTemp.ForecastTempDiff = tempForecast - tempNow;
            if ((myTemp.ForecastTempDiff < myTemp.ForecastTempDiffLimit) || (myTemp.WindGust > myTemp.WindLimit)) myTemp.ACTarget += 0.5f;
            logger.LogInformation("Forecast temp return value: " + myTemp.ACTarget);
            return myTemp;
        }

        private static float GetValueFromForecastJSON(ILogger logger, JsonElement weatherData)
        {
            float _returnValue = 0;
            string currentForcastValueString = weatherData.GetProperty("values")[0].ToString();
            logger.LogDebug(weatherData.GetProperty("name").ToString() + ": " + currentForcastValueString);
            if (float.TryParse(currentForcastValueString, out float result)) { _returnValue = float.Parse(currentForcastValueString); }
            return _returnValue;
           
        }
    }
}
