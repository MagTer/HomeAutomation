// This Homeyscript is intended to be run every minute to get frequent updates on the tags but it does not do anything if there are no new log lines in the timeline.


// Config
var tagConfigs = [
  { tagDeviceName: "M2 Tag 6" }
];


// GetDeviceID function
function GetDeviceID(currentDeviceName) {
  for (const device of Object.values(devices)) {
    if (currentDeviceName === device.name) {
      return device.id;
    }
  }
}

async function GetFilteredNotifications() {
  const response = await Homey.notifications.getNotifications();
  const items = Object.values(response);

  items.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  const lastItems = items.slice(0, 5);

  
  const excerptsWithTimestamp = lastItems.map(item => {
    const timestamp = new Date(item.dateCreated);
  
    timestamp.setHours(timestamp.getHours() + 2);
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const timestampStr = `${hours}:${minutes}`;
    
    // adapt common strings to fit screen size
    let activeExerpt = item.excerpt.replaceAll("**","");
    activeExerpt = activeExerpt.replace('"',"");
    activeExerpt = activeExerpt.replace("har automatiskt uppdaterats till version","har uppdaterats:");
    activeExerpt = activeExerpt.replace(" Ternström","");
    activeExerpt = activeExerpt.replace(" Kastemyr","");
    if (activeExerpt.match("Nivå")) { activeExerpt = activeExerpt.substr(0, activeExerpt.indexOf(" Nivå")); }
    activeExerpt = activeExerpt.length > 32 ? activeExerpt.substring(0, 33) : activeExerpt;

    return `${timestampStr} ${activeExerpt}`;
  });

  // Check if the recent log line is created within the last 100 seconds
  const mostRecentTimestamp = new Date(lastItems[0].dateCreated);
  mostRecentTimestamp.setHours(mostRecentTimestamp.getHours() + 2);
  const currentTime = new Date();
  currentTime.setHours(currentTime.getHours() + 2);
  const timeDifference = currentTime.getTime() - mostRecentTimestamp.getTime();
  if (timeDifference < 100000) {needsUpdate = true}; 
  log("Time diff: " + timeDifference)  
  return excerptsWithTimestamp;
}

function CreateTagContent(logLines) {
  log('Generating tag content')
  //log(logLines)
  var responseJSON = "["
  responseJSON +="{ \"text\": [2, 2, \"Automationslogg\", \"fonts/bahnschrift20\", 1, 0, 120 ] },"
  responseJSON +="{ \"line\": [2,21,294,21,2]},"
  responseJSON +="{ \"line\": [2,22,294,22,2]},"
  responseJSON +="{ \"text\": [2, 30, \"" + logLines[0] + "\", \"fonts/calibrib16\", 1, 0, 0 ] },"
  responseJSON +="{ \"text\": [2, 50, \"" + logLines[1] + "\", \"fonts/calibrib16\", 1, 0, 0 ] },"
  responseJSON +="{ \"text\": [2, 70, \"" + logLines[2] + "\", \"fonts/calibrib16\", 1, 0, 0 ] },"
  responseJSON +="{ \"text\": [2, 90, \"" + logLines[3] + "\", \"fonts/calibrib16\", 1, 0, 0 ] },"
  responseJSON +="{ \"text\": [2, 110, \"" + logLines[4] + "\", \"fonts/calibrib16\", 1, 0, 0 ] }"
  responseJSON +="]"
  log("JSON: " + responseJSON)
  return responseJSON;
}


async function UpdateTag(currentDeviceName, tagContent) {
  log('Sending tag update request')
  var currentDeviceID = GetDeviceID(currentDeviceName)
  var flowUri = "homey:device:" + currentDeviceID;
  await Homey.flow.runFlowCardAction({
    uri: flowUri,
    id: flowUri + ':show-local-json-template',
    args: {
      "JSON": tagContent
    }
  });
}



// Script execution
log('Starting tag updates');
var needsUpdate = false;
const devices = await Homey.devices.getDevices();
const logLines = await GetFilteredNotifications();
var tagContent = CreateTagContent(logLines);
// Debug
// needsUpdate = true


if (needsUpdate) {
  for (let i = 0; i < tagConfigs.length; i++) {
    log('Updating tag ' + tagConfigs[i].tagDeviceName);
    await UpdateTag(tagConfigs[i].tagDeviceName, tagContent);
    await wait(200);
    log(' ');
  }

} else {
  log('No update needed. Skipping tag update.');
}

log('Tag updates completed');
