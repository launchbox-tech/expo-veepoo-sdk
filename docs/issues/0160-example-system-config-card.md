# feat(example): SystemConfigCard — language, time, BT status, device functions

**Issue:** #160
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `SystemConfigCard` covering five system-configuration SDK methods not yet reachable from the example.

## Acceptance criteria

- [ ] "Check Bluetooth" → `checkBluetoothStatus()`, displays boolean result
- [ ] "Connection status" → `getConnectionStatus()`, displays status string
- [ ] "Read functions" → `readDeviceFunctions()`, displays result as JSON
- [ ] "Set language" → `setLanguage('english')`, displays operation status
- [ ] "Set time" → `setDeviceTime(new Date())`, displays operation status
