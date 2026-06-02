"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const DEFAULT_OPTIONS = {
    bluetoothAlwaysPermission: 'This app needs Bluetooth permission to connect to Veepoo devices',
    bluetoothPeripheralPermission: 'This app needs Bluetooth permission to scan and connect to devices',
    locationWhenInUsePermission: 'This app uses your location to scan for nearby Bluetooth devices',
};
const withVeepooSDK = (config, props) => {
    const options = {
        bluetoothAlwaysPermission: props?.bluetoothAlwaysPermission ?? DEFAULT_OPTIONS.bluetoothAlwaysPermission,
        bluetoothPeripheralPermission: props?.bluetoothPeripheralPermission ?? DEFAULT_OPTIONS.bluetoothPeripheralPermission,
        locationWhenInUsePermission: props?.locationWhenInUsePermission ?? DEFAULT_OPTIONS.locationWhenInUsePermission,
    };
    config = withIOSBluetoothPermissions(config, options);
    config = withAndroidBluetoothPermissions(config);
    return config;
};
const withIOSBluetoothPermissions = (config, options) => {
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        if (options.bluetoothAlwaysPermission) {
            config.modResults.NSBluetoothAlwaysUsageDescription =
                options.bluetoothAlwaysPermission;
        }
        if (options.bluetoothPeripheralPermission) {
            config.modResults.NSBluetoothPeripheralUsageDescription =
                options.bluetoothPeripheralPermission;
        }
        if (options.locationWhenInUsePermission) {
            config.modResults.NSLocationWhenInUseUsageDescription =
                options.locationWhenInUsePermission;
        }
        return config;
    });
};
const withAndroidBluetoothPermissions = (config) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        const mainApplication = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        config_plugins_1.AndroidConfig.Manifest.addMetaDataItemToMainApplication(mainApplication, 'expo.modules.veepoo.enabled', 'true');
        const permissions = [
            'android.permission.BLUETOOTH',
            'android.permission.BLUETOOTH_ADMIN',
            'android.permission.BLUETOOTH_CONNECT',
            'android.permission.BLUETOOTH_SCAN',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION',
        ];
        permissions.forEach((permission) => {
            if (!Array.isArray(config.modResults.manifest['uses-permission']) ||
                !config.modResults.manifest['uses-permission'].some((p) => p.$['android:name'] === permission)) {
                if (!config.modResults.manifest['uses-permission']) {
                    config.modResults.manifest['uses-permission'] = [];
                }
                config.modResults.manifest['uses-permission'].push({
                    $: { 'android:name': permission },
                });
            }
        });
        return config;
    });
};
exports.default = withVeepooSDK;
//# sourceMappingURL=index.js.map