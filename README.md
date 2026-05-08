# homebridge-somfy-rfxcom

Homebridge plugin for controlling [Somfy RTS](https://www.somfy.com/) blinds, awnings, and gates through HomeKit, via an [RFXtrx433(E)](http://www.rfxcom.com/RFXtrx433E-USB-43392MHz-Transceiver/en) USB transceiver.

This fork was rewritten with motorized Somfy RTS gates in mind and is, in my experience, the most reliable option for that use case. It also works with RFY blinds and awnings.

Originally based on [glefand/homebridge-rfxcom](https://github.com/glefand/homebridge-rfxcom) and [jhurliman/homebridge-rfxcom](https://github.com/jhurliman/homebridge-rfxcom).

## Features

- **Homebridge v2.0 support** — fully compatible with Homebridge 2.0
- **Homebridge UI configuration** — configure the plugin directly from the Homebridge UI (no manual JSON editing required)
- **Modern characteristic API** — uses `onGet`/`onSet` for reliable accessory restoration after restarts
- **Node 22 / 24 support**

## Compatibility

| Requirement | Version |
|---|---|
| Homebridge | ^1.6.0 \|\| ^2.0.0 |
| Node.js | ^22.12.0 \|\| ^24.0.0 |

## Installation

```bash
npm install -g homebridge-somfy-rfxcom
```

Or install via the **Homebridge UI** by searching for `homebridge-somfy-rfxcom`.

## Configuration

This plugin can be configured through the **Homebridge UI**. Alternatively, add the following to your `config.json`:

```json
{
  "platforms": [
    {
      "platform": "SomfyRFXCom",
      "name": "Somfy RFXCom",
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
| `platform` | Yes | — | Must be `SomfyRFXCom` |
| `name` | Yes | — | Display name for the platform |
| `tty` | No | `/dev/ttyUSB0` | Path to the RFXtrx USB device |
| `debug` | No | `false` | Enable debug logging |

### RFY Remotes

| Option | Required | Default | Description |
|---|---|---|---|
| `name` | Yes | — | Display name in HomeKit |
| `deviceID` | Yes | — | Remote address and unit code (e.g. `0x010000/1`). Found in RFXMngr (Windows). |
| `openCloseSeconds` | No | `5` | Seconds for the blinds/awning/gate to fully open or close |

## How It Works

Each RFY remote creates three switches in HomeKit: **Up**, **Down**, and **Stop**. The active switch auto-resets after `openCloseSeconds` to reflect that the movement has completed.

## Programming a New Remote

Before a Somfy device will respond to commands from your RFXtrx, the device's address must be programmed into the motor. Use [RFXMngr](http://www.rfxcom.com/epages/78165469.sf/en_GB/?ObjectPath=/Shops/78165469/Categories/Downloads) (Windows) to assign and program a new remote address, then use that address as the `deviceID` in your config.

## License

MIT
