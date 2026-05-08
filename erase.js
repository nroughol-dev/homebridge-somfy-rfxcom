#!/usr/bin/env node
'use strict'

// Standalone helper to erase an RFY remote address from a Somfy motor.
// Usage: node erase.js <tty> <deviceID>
//   e.g. node erase.js /dev/ttyUSB0 0x010000/1

const rfxcom = require('rfxcom')

const tty = process.argv[2] || '/dev/ttyUSB0'
const deviceID = process.argv[3]

if (!deviceID) {
  console.error('Usage: node erase.js <tty> <deviceID>')
  console.error('  e.g. node erase.js /dev/ttyUSB0 0x010000/1')
  process.exit(1)
}

const rfxtrx = new rfxcom.RfxCom(tty, { debug: true })
const rfy = new rfxcom.Rfy(rfxtrx, rfxcom.rfy.RFY)

rfxtrx.initialise(() => {
  rfy.erase(deviceID, (err) => {
    if (err) {
      console.error('Erase failed:', err)
      process.exit(1)
    }
    console.log('complete')
    process.exit(0)
  })
})
