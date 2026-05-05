# @nroughol/homebridge-rfxcom

Homebridge plugin for [RFXtrx433(E)](http://www.rfxcom.com/RFXtrx433E-USB-43392MHz-Transceiver/en) transceivers. Control RFY (Somfy RTS) blinds, awnings, and gates through HomeKit.

Other RFXcom plugins exist with broader feature sets. This one was rewritten with motorized Somfy RTS gates in mind and is, in my experience, the most reliable option for that use case.

Fork of [glefand/homebridge-rfxcom](https://github.com/glefand/homebridge-rfxcom), originally from [jhurliman/homebridge-rfxcom](https://github.com/jhurliman/homebridge-rfxcom).

## What's New in This Fork

- **Homebridge v2.0 support** — fully compatible with Homebridge 2.0
- **Homebridge UI configuration** — configure the plugin directly from the Homebridge GUI (no more manual JSON editing)
- **Modern characteristic API** — uses `onGet`/`onSet` for reliable accessory restoration after restarts
- **Node 22/24 support**

## Compatibility

| Requirement | Version |
|---|---|
| Homebridge | ^1.6.0 \|\| ^2.0.0 |
| Node.js | ^22.12.0 \|\| ^24.0.0 |

## Installation

```bash
npm install -g @nroughol/homebridge-rfxcom
```

## Configuration

This plugin can be configured through the **Homebridge UI**. Alternatively, add the following to your `config.json`:

```json
{
  "platforms": [
    {
      "platform": "RFXCom",
      "name": "RFXCom",
      "tty": "/dev/ttyUSB0",
      "debug": false,
      "rfyRemotes": [
        {
          "name": "Awning",
          "deviceID": "0x010000/1",
          "openCloseSeconds": 18
        }
      ]
    }
  ]
}
```

### Platform Options

| Option | Required | Default | Description |
|---|---|---|---|
| `platform` | Yes | — | Must be `RFXCom` |
| `name` | Yes | — | Display name for the platform |
| `tty` | No | `/dev/ttyUSB0` | Path to the RFXtrx USB device |
| `debug` | No | `false` | Enable debug logging |

### RFY Remotes

| Option | Required | Default | Description |
|---|---|---|---|
| `name` | Yes | — | Display name in HomeKit |
| `deviceID` | Yes | — | Remote address and unit code (e.g. `0x010000/1`). Found in RFXMngr (Windows). |
| `openCloseSeconds` | No | `5` | Seconds for the blinds/awning to fully open or close |

## How It Works

Each RFY remote creates three switches in HomeKit: **Up**, **Down**, and **Stop**. The switches auto-reset after `openCloseSeconds` to reflect that the movement has completed.

## License

MIT
