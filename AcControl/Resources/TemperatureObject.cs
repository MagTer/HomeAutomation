using Microsoft.Azure.Functions.Worker.Http;
using System.Web;

namespace AcControl.Resources
{
    class TemperatureObject
    {
        public float ACTargetMax = 21.5f ;
        public float ACTargetMin = 18.5f;
        public float OutdoorRangeMin = -12f;
        public float OutdoorRangeMax = 15f;
        public float RoomTarget;
        public float RoomTargetMin;
        public float RoomTargetMax;
        public float OutdoorTemp;
        public float IndoorTemp;
        public float ACTarget;
        public float WindSpeed;
        public float WindGust;
        public float WindLimit = 10f;
        public float WindDirection;
        public float ForecastTempDiff;
        public float ForecastTempDiffLimit = -3f;

        public TemperatureObject(HttpRequestData req)
        {
            var query = HttpUtility.ParseQueryString(req.Url.Query);
            float.TryParse(query["inside"], out IndoorTemp);
            float.TryParse(query["outside"], out OutdoorTemp);
            float.TryParse(query["target"], out RoomTarget);
            if (RoomTarget == 0) RoomTarget = 22.1f;
            RoomTargetMin = RoomTarget - 1.1f;
            RoomTargetMax = RoomTarget + 1.1f;
        }
    }
}
