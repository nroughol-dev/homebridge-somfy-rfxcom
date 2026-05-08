const rfxcom = require('rfxcom')

const PLUGIN_ID = 'homebridge-somfy-rfxcom'
const PLUGIN_NAME = 'SomfyRFXCom'
const DEFAULT_OPEN_CLOSE_SECONDS = 5

let Accessory, Service, Characteristic, UUIDGen

module.exports = function(homebridge) {
  Accessory = homebridge.platformAccessory
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid

  homebridge.registerPlatform(PLUGIN_ID, PLUGIN_NAME, RFXComPlatform, true)
}

function RFXComPlatform(log, config, api) {
  this.log = log
  this.config = config || { platform: PLUGIN_NAME }
  this.tty = this.config.tty || '/dev/ttyUSB0'
  this.debug = this.config.debug || false

  const rfyRemotes = this.config.rfyRemotes || this.config.rfyremotes
  this.rfyRemotes = Array.isArray(rfyRemotes) ? rfyRemotes : []

  this.accessories = {}
  this.rfxtrx = null
  this.rfy = null

  if (api) {
    this.api = api
    this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this))
  }
}

// Method to restore accessories from cache
RFXComPlatform.prototype.configureAccessory = function(accessory) {
  this.log(
    `Loaded from cache: ${accessory.context.name} (${accessory.context
      .switchID})`
  )

  const existing = this.accessories[accessory.context.switchID]
  if (existing) this.removeAccessory(existing)

  this.accessories[accessory.context.switchID] = accessory
}

// Method to setup accesories from config.json
RFXComPlatform.prototype.didFinishLaunching = function() {
  if (!this.rfyRemotes.length) {
    this.log('No RFY remotes configured. Add remotes via the Homebridge UI to get started.')
    this.removeAccessories()
    return
  }

  this.rfxtrx = new rfxcom.RfxCom(this.tty, { debug: this.debug })
  this.rfy = new rfxcom.Rfy(this.rfxtrx, rfxcom.rfy.RFY)

  this.rfxtrx.on('disconnect', () => this.log('ERROR: RFXtrx disconnect'))
  this.rfxtrx.on('connectfailed', () => this.log('ERROR: RFXtrx connect fail'))

  // Compare local config against RFXCom-registered remotes
  this.listRFYRemotes()
    .then(deviceRemotes => {
      this.log(`Received ${deviceRemotes.length} remote(s) from device`)

      this.rfyRemotes.forEach(remote => {
        // Handle different capitalizations of deviceID
        remote.deviceID = remote.deviceID || remote.deviceId

        const deviceID = remote.deviceID
        const device = deviceRemotes.find(dR => deviceID === dR.deviceId)

        if (device) {
          this.addRFYRemote(remote, device)
          this.log(`Added accessories for RFY remote ${remote.deviceID}`)
        } else {
          const msg = deviceRemotes.map(dR => `${dR.deviceId}`).join(', ')
          this.log(`ERROR: RFY remote ${deviceID} not found. Found: ${msg}`)
        }
      })
    })
    .catch(err => {
      this.log(`UNHANDLED ERROR: ${err}`)
    })
}

RFXComPlatform.prototype.listRFYRemotes = function() {
  return new Promise((resolve, reject) => {
    this.rfxtrx.once('rfyremoteslist', remotes => resolve(remotes))

    this.rfxtrx.initialise(() => {
      this.log('RFXtrx initialized, listing remotes...')
      this.rfy.listRemotes()
    })
  })
}

// Method to add or update HomeKit accessory
RFXComPlatform.prototype.addRFYRemote = function(remote, device) {
  remote.switches = {}

  this.addRFYRemoteSwitch(remote, device, 'Up')
  this.addRFYRemoteSwitch(remote, device, 'Down')
  this.addRFYRemoteSwitch(remote, device, 'Stop')
}

RFXComPlatform.prototype.addRFYRemoteSwitch = function(remote, device, type) {
  const deviceID = remote.deviceID
  const switchID = `${deviceID}/${type}`
  const name = `${remote.name} ${type}`

  let accessory = this.accessories[switchID]
  let isNew = false

  if (!accessory) {
    this.log(`Creating new accessory: ${switchID}`)
    const uuid = UUIDGen.generate(switchID)
    accessory = new Accessory(remote.name, uuid)
    isNew = true
  } else {
    this.log(`Restoring cached accessory: ${switchID}`)
  }

  this.accessories[switchID] = accessory

  accessory.context = {
    deviceID: deviceID,
    switchID: switchID,
    name: name,
    device: device,
    isOn: accessory.context.isOn || false
  }

  remote.switches[type] = accessory

  if (!accessory.getService(Service.Switch)) {
    accessory.addService(Service.Switch, name)
  }

  accessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'RFXCOM')
    .setCharacteristic(Characteristic.Model, device.remoteType)
    .setCharacteristic(
      Characteristic.SerialNumber,
      `${deviceID}-${device.unitCode}-${type}`
    )

  accessory
    .on('identify', (paired, callback) => {
      this.log(`${name} identify requested, paired=${paired}`)
      callback()
    })

  const characteristic = accessory
    .getService(Service.Switch)
    .getCharacteristic(Characteristic.On)

  characteristic.removeAllListeners('get')
  characteristic.removeAllListeners('set')

  characteristic
    .onGet(() => accessory.context.isOn)
    .onSet((value) => {
      if (!value || type === 'Stop') {
        this.log(`RFY STOP ${remote.deviceID}`)
        this.rfy.stop(remote.deviceID)

        setTimeout(() => {
          for (const t in remote.switches)
            this.setSwitch(remote.switches[t], false)
        }, 100)

        return
      }

      switch (type) {
        case 'Up':
          this.log(`RFY UP ${remote.deviceID}`)
          this.rfy.up(remote.deviceID)
          break
        case 'Down':
          this.log(`RFY DOWN ${remote.deviceID}`)
          this.rfy.down(remote.deviceID)
          break
      }

      for (const t in remote.switches)
        this.setSwitch(remote.switches[t], t === type)

      const ms = isNaN(remote.openCloseSeconds)
        ? DEFAULT_OPEN_CLOSE_SECONDS * 1000
        : Math.round(remote.openCloseSeconds * 1000)
      clearTimeout(accessory.timerID)
      accessory.timerID = setTimeout(() => this.setSwitch(accessory, false), ms)
    })

  if (isNew) {
    this.api.registerPlatformAccessories(PLUGIN_ID, PLUGIN_NAME, [accessory])
  } else {
    this.api.updatePlatformAccessories([accessory])
  }

  this.setSwitch(accessory, accessory.context.isOn)

  return accessory
}

RFXComPlatform.prototype.setSwitch = function(accessory, isOn) {
  this.log(`Updating switch ${accessory.context.switchID}, on=${isOn}`)

  accessory.context.isOn = isOn
  accessory
    .getService(Service.Switch)
    .getCharacteristic(Characteristic.On)
    .updateValue(isOn)
}

// Method to remove accessories from HomeKit
RFXComPlatform.prototype.removeAccessory = function(accessory) {
  if (!accessory) return

  const switchID = accessory.context.switchID
  this.log(`${accessory.context.name} (${switchID}) removed from HomeBridge.`)
  this.api.unregisterPlatformAccessories(PLUGIN_ID, PLUGIN_NAME, [accessory])
  delete this.accessories[switchID]
}

// Method to remove all accessories from HomeKit
RFXComPlatform.prototype.removeAccessories = function() {
  Object.values(this.accessories).forEach(accessory => this.removeAccessory(accessory))
}
