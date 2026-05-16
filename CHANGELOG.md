# Changelog

## 2.0.3 — Verified by Homebridge

- [DOCS] Added the Homebridge "verified" badge to the README
- [FEAT] Added a PayPal funding link in `package.json` so the Homebridge UI tile shows a ❤️ Donate button

## 2.0.2 — Config schema fix

- [FIX] Corrected `config.schema.json` validation so the Homebridge UI accepts saved configurations

## 2.0.1 — Switch labels

- [CHANGE] HomeKit switch names now include the remote name (e.g. `Awning Up` instead of just `Up`) so multiple remotes are easier to tell apart

## 2.0.0 — Rename to homebridge-somfy-rfxcom

- [CHANGE] Renamed package from `@nroughol/homebridge-rfxcom` to `homebridge-somfy-rfxcom` (unscoped) for Homebridge verification
- [CHANGE] Renamed platform identifier from `RFXCom` to `SomfyRFXCom` to avoid collision with the original `homebridge-rfxcom`
- [BREAKING] Existing users must update both their `npm install` target and the `"platform"` value in `config.json`
- [FEAT] Homebridge v2.0 / HAP-NodeJS v2 support
- [FEAT] Node 22 / 24 support; modern `onGet`/`onSet` characteristic API for reliable accessory restoration
- [DOCS] Rewrote the README around the Somfy RTS gate / blind / awning use case
