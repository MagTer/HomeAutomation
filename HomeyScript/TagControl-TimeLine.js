// This Homeyscript is intended to be run every minute to get frequent updates on the tags but it does not do anything if there are no new log lines in the timeline.
// The config section includes parameters for line count and line length to adjust for different display sizes on the tags


// Config
var tagConfigs = [
  { tagDeviceName: "M2 Tag 6", lineCount: 5, lineLengthCap: 34},
  { tagDeviceName: "M2 4 - Tag 2", lineCount: 13, lineLengthCap: 50}
];


// GetDeviceID function
function GetDeviceID(currentDeviceName) {
  for (const device of Object.values(devices)) {
    if (currentDeviceName === device.name) {
      return device.id;
    }
  }
}

async function GetNotifications() {
  const response = await Homey.notifications.getNotifications();
  const items = Object.values(response);
  items.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  return items;
}


async function GetNotificationUpdateNeed(items) {
  var localNeedsUpdate = false
  const mostRecentTimestamp = new Date(items[0].dateCreated);
  mostRecentTimestamp.setHours(mostRecentTimestamp.getHours() + 2);
  const currentTime = new Date();
  currentTime.setHours(currentTime.getHours() + 2);
  const timeDifference = currentTime.getTime() - mostRecentTimestamp.getTime();
  if (timeDifference < 100000) {localNeedsUpdate = true}; 
  log("Time diff: " + timeDifference)  
  log("Update check return value: " + localNeedsUpdate)
  return localNeedsUpdate;
}



async function GetFilteredNotifications(items, lineCount, lineLengthCap) {

  const lastItems = items.slice(0, lineCount);

  
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

    // Trim based on specific words if the current screen is small
    if (lineLengthCap < 42) {
       if (activeExerpt.match("Nivå:")) { activeExerpt = activeExerpt.substr(0, activeExerpt.indexOf(" Nivå")); }
       if (activeExerpt.match("Temp:")) { activeExerpt = activeExerpt.substr(0, activeExerpt.indexOf(" Temp")); }
    }

    activeExerpt = activeExerpt.length > lineLengthCap ? activeExerpt.substring(0, lineLengthCap + 1) : activeExerpt;
    return `${timestampStr} ${activeExerpt}`;
  });

  return excerptsWithTimestamp;
}

function CreateTagContent(logLines) {
  log('Generating tag content')
  //log(logLines)
  var responseJSON = "["
  responseJSON +="{ \"text\": [4, 3, \"Automationslogg\", \"fonts/bahnschrift20\", 1, 0, 120 ] },"
  responseJSON +="{ \"line\": [4,21,400,21,2]},"
  responseJSON +="{ \"line\": [4,22,400,22,2]},"

  for (let l = 0; l < logLines.length; l++) {
    var yAxis = 30 + (l * 20)
    responseJSON +="{ \"text\": [4, " + yAxis + ", \"" + logLines[l] + "\", \"fonts/calibrib16\", 1, 0, 0 ] },"
  }

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
log('Starting tag update script');
const homeyNotifications = await GetNotifications();
const needsUpdate = await GetNotificationUpdateNeed(homeyNotifications);
const devices = await Homey.devices.getDevices();

if (needsUpdate) {
  for (let i = 0; i < tagConfigs.length; i++) {
    log('Updating tag ' + tagConfigs[i].tagDeviceName);
    var logLines = await GetFilteredNotifications(homeyNotifications, tagConfigs[i].lineCount, tagConfigs[i].lineLengthCap);
    var tagContent = CreateTagContent(logLines);
    await UpdateTag(tagConfigs[i].tagDeviceName, tagContent);
    await wait(200);
    log(' ');
  }

} else {
  log('No update needed. Skipping tag update.');
}

log('Tag updates completed');
