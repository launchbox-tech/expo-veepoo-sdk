require("../index.cjs");
let expo_config_plugins_js = require("expo/config-plugins.js");
//#region src/plugin/index.ts
const DEFAULT_OPTIONS = {
	bluetoothAlwaysPermission: "This app needs Bluetooth permission to connect to Veepoo devices",
	bluetoothPeripheralPermission: "This app needs Bluetooth permission to scan and connect to devices",
	locationWhenInUsePermission: "This app uses your location to scan for nearby Bluetooth devices"
};
const withVeepooSDK = (config, props) => {
	const options = {
		bluetoothAlwaysPermission: props?.bluetoothAlwaysPermission ?? DEFAULT_OPTIONS.bluetoothAlwaysPermission,
		bluetoothPeripheralPermission: props?.bluetoothPeripheralPermission ?? DEFAULT_OPTIONS.bluetoothPeripheralPermission,
		locationWhenInUsePermission: props?.locationWhenInUsePermission ?? DEFAULT_OPTIONS.locationWhenInUsePermission
	};
	config = withIOSBluetoothPermissions(config, options);
	config = withAndroidBluetoothPermissions(config);
	return config;
};
const withIOSBluetoothPermissions = (config, options) => {
	return (0, expo_config_plugins_js.withInfoPlist)(config, (config) => {
		if (options.bluetoothAlwaysPermission) config.modResults.NSBluetoothAlwaysUsageDescription = options.bluetoothAlwaysPermission;
		if (options.bluetoothPeripheralPermission) config.modResults.NSBluetoothPeripheralUsageDescription = options.bluetoothPeripheralPermission;
		if (options.locationWhenInUsePermission) config.modResults.NSLocationWhenInUseUsageDescription = options.locationWhenInUsePermission;
		return config;
	});
};
const withAndroidBluetoothPermissions = (config) => {
	return (0, expo_config_plugins_js.withAndroidManifest)(config, (config) => {
		const mainApplication = expo_config_plugins_js.AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
		expo_config_plugins_js.AndroidConfig.Manifest.addMetaDataItemToMainApplication(mainApplication, "expo.modules.veepoo.enabled", "true");
		[
			"android.permission.BLUETOOTH",
			"android.permission.BLUETOOTH_ADMIN",
			"android.permission.BLUETOOTH_CONNECT",
			"android.permission.BLUETOOTH_SCAN",
			"android.permission.ACCESS_FINE_LOCATION",
			"android.permission.ACCESS_COARSE_LOCATION"
		].forEach((permission) => {
			if (!Array.isArray(config.modResults.manifest["uses-permission"]) || !config.modResults.manifest["uses-permission"].some((p) => p.$["android:name"] === permission)) {
				if (!config.modResults.manifest["uses-permission"]) config.modResults.manifest["uses-permission"] = [];
				config.modResults.manifest["uses-permission"].push({ $: { "android:name": permission } });
			}
		});
		return config;
	});
};
//#endregion
module.exports = withVeepooSDK;

//# sourceMappingURL=index.cjs.map