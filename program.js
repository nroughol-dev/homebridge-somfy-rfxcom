#!/usr/bin/env node
'use strict'

// Standalone helper to program an RFY remote address into a Somfy motor.
// Put the motor into programming mode first, then run:
//   node program.js <tty> <deviceID>
//   e.g. node program.js /dev/ttyUSB0 0x010000/1

const rfxcom = require('rfxcom')

const tty = process.argv[2] || '/dev/ttyUSB0'
const deviceID = process.argv[3]

if (!deviceID) {
  console.error('Usage: node program.js <tty> <deviceID>')
  console.error('  e.g. node program.js /dev/ttyUSB0 0x010000/1')
  process.exit(1)
}

const rfxtrx = new rfxcom.RfxCom(tty, { debug: true })
const rfy = new rfxcom.Rfy(rfxtrx, rfxcom.rfy.RFY)

rfxtrx.initialise(() => {
  rfy.program(deviceID, (err) => {
    if (err) {
      console.error('Program failed:', err)
      process.exit(1)
    }
    console.log('complete')
    process.exit(0)
  })
})
