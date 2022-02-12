const devices = await Homey.devices.getDevices();

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

for (const device of Object.values(devices)) {
  if (device.capabilitiesObj.measure_temperature) {
    var currentCapability = device.makeCapabilityInstance('measure_temperature');
    let logString = ('Sensor "' + device.name + '" is stale')
    let currentlastchanged = new Date(currentCapability.lastChanged)
    let comparissonDate = new Date().addHours(-24);
    if (currentlastchanged < comparissonDate) {
      await Homey.flow.runFlowCardAction({
      uri: 'homey:manager:notifications',
        id: 'create_notification',
        args: {
        text: logString
        },
      });
    }
  }
}