// Referenstemperatur innomhus 
let halluppe = await Homey.devices.getDevice({id: '0a6d05f3-fa86-412b-a744-4ea297104ee4'});
let vardagsrummet = await Homey.devices.getDevice({id: '26af43f7-e379-4544-a99c-e0c51538d391'});

// Referenstemperatur utomhus
let tempute = await Homey.devices.getDevice({id: 'f3fda98e-2cec-42ea-abd8-872d48eb67ea'});

// Heat pumps
let daikin_uppe = await Homey.devices.getDevice({id: '32126661-bf68-4ec0-8437-339a5f205436'});
let daikin_nere = await Homey.devices.getDevice({id: '3ae033b8-3344-423e-b01d-298e341ddfdb'});

async function logToTimeline(logString) {
  await Homey.flow.runFlowCardAction({
    uri: 'homey:manager:notifications',
    id: 'create_notification',
    args: {
      text: logString
    },
  });
  log ('To Timeline: ', logString)
}


async function SetDaikinTargetfromAPI(currentPump,indoorSensor,outdoorSensor) {
  // Extract sensor data
  var currentIndoorSensorCapability = indoorSensor.makeCapabilityInstance('measure_temperature');
  var indoorTemp = currentIndoorSensorCapability.value
  var currentOutdoorSensorCapability = outdoorSensor.makeCapabilityInstance('measure_temperature');
  var outdoorTemp = currentOutdoorSensorCapability.value
  log (`Input - oudoor: `, outdoorTemp)
  log (`Input - indoor: `, indoorTemp)


  // Send API request
  var requestURL = 'https://accontrol.azurewebsites.net'
  requestURL += '/api/AcControl?code=REMOVED&inside=' 
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
  if (parsedTarget >= 17 && parsedTarget <= 25) {
    if (parsedTarget != currentTargetTemp) {
        await currentPump.setCapabilityValue('target_temperature', parsedTarget)
        .then(() => logToTimeline(logString))
        .catch(error => log(`Error setting temp Uppe:`, error));
    } else {
      log ('No update to heatpump needed.')
    }
  }
}



if (args[0] === 'uppe') {
  await SetDaikinTargetfromAPI(daikin_uppe,halluppe,tempute)
} else {
  await SetDaikinTargetfromAPI(daikin_nere,vardagsrummet,tempute)
}
