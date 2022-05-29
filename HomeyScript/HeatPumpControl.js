// Referenstemperatur utomhus
let outdoorSensor = await Homey.devices.getDevice({id: 'f3fda98e-2cec-42ea-abd8-872d48eb67ea'});

// Inputvärden baserat på input parameter
if (args[0] === 'uppe') {
  var indoorSensor = await Homey.devices.getDevice({id: '0a6d05f3-fa86-412b-a744-4ea297104ee4'});
  var currentPump = await Homey.devices.getDevice({id: '32126661-bf68-4ec0-8437-339a5f205436'});

} else {
  var indoorSensor = await Homey.devices.getDevice({id: '26af43f7-e379-4544-a99c-e0c51538d391'});
  var currentPump = await Homey.devices.getDevice({id: '3ae033b8-3344-423e-b01d-298e341ddfdb'});
}

var indoorTemp = indoorSensor.capabilitiesObj.measure_temperature.value
var outdoorTemp = outdoorSensor.capabilitiesObj.measure_temperature.value
log (`oudoorTemp: `, outdoorTemp)
log (`indoorTemp: `, indoorTemp)
log (`Pump Operatons mode: `, currentPump.capabilitiesObj.thermostat_mode_std.value)
log (`Pump target temp: `, currentPump.capabilitiesObj.target_temperature.value)


async function LogToTimeline(logString) {
  log('Entering LogToTimeLine')
  await Homey.flow.runFlowCardAction({
    uri: 'homey:manager:notifications',
    id: 'create_notification',
    args: {
      text: logString
    },
  });
  log ('To Timeline: ', logString)
}

async function SetHeatingTargetfromAPI() {
  log('Entering SetHeatingTargetfromAPI')

  // Send API request
  var requestURL = 'https://accontrol.azurewebsites.net'
  requestURL += '/api/AcControl?code=BIxawKVNvP1m59XRCFcn4Qw/MceiWsUxDewD4FTrtWpLLNyrlmHWzg==&inside=' 
  requestURL += indoorTemp 
  requestURL += '&outside='
  requestURL += outdoorTemp
  
  const res = await fetch(requestURL);
  if (!res.ok) {
   throw new Error(res.statusText);
  }

  const apiResponse = await res.json();
  targetTemp = apiResponse.Temperature
  log (`API Response: `, targetTemp)

  // Set targets
  var currentTargetCapability = currentPump.makeCapabilityInstance('target_temperature');
  var currentTargetTemp = currentTargetCapability.value
  log ('Current target: ' + currentTargetTemp)
  var parsedTarget = Math.round(parseInt(targetTemp))
  var logString = 'Target ' + currentPump.name + ': ' + parsedTarget + '  (' + indoorTemp + '/' + outdoorTemp + ')'
  return (parsedTarget)
}

async function SetCoolingTarget() {
  log('Entering SetCoolingTarget')
  return (22);
}

async function SetDaikinTarget() {
  log('Entering SetDaikinTarget')
  var logString = 'Target ' + currentPump.name + ': ' + mainTargetTemp + '  (' + indoorTemp + '/' + outdoorTemp + ')'
  if (mainTargetTemp != currentPump.capabilitiesObj.target_temperature.value) {
    await currentPump.setCapabilityValue('target_temperature', mainTargetTemp)
    .then(() => LogToTimeline(logString))
    .catch(error => log(`Error setting temp:`, error));
  } else {
    log ('No update to heatpump needed.')
  }
}


var mainTargetTemp = "0"

if (currentPump.capabilitiesObj.thermostat_mode_std.value == 'heat') {
  mainTargetTemp = await SetHeatingTargetfromAPI()
}

if (currentPump.capabilitiesObj.thermostat_mode_std.value == 'cool') {
  mainTargetTemp = await SetCoolingTarget()
}

if (currentPump.capabilitiesObj.thermostat_mode_std.value != 'off') {
  await SetDaikinTarget()
} else { 
  log('Operations mode is off, skipping')
}
