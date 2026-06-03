"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
// The four VeepooBleSDK dependencies that ship as dynamic frameworks (DYLIBs).
// They are device-only (arm64/armv7, no simulator slice) and must be copied into
// the app's Frameworks/ folder or the app crashes at launch with
// "Library not loaded: @rpath/JLDialUnit.framework/JLDialUnit".
const DYNAMIC_FRAMEWORKS = ['ABParTool', 'GRDFUSDK', 'JLDialUnit', 'ZipZap'];
const EMBED_PHASE_NAME = 'Embed VeepooSDK Dynamic Frameworks';
// Run-script body added to the *app* target. The VeepooSDK pod is a static
// library, so its own build phases have no FRAMEWORKS_FOLDER_PATH and cannot
// reach the app bundle — embedding must happen here, in the app target.
// `cp -RL` dereferences symlinks (bun `file:` deps symlink the framework
// binaries) so codesign receives regular files.
const EMBED_SCRIPT = [
    'set -eu',
    'case "${PLATFORM_NAME:-}" in iphonesimulator*) echo "VeepooSDK: skip embed on simulator"; exit 0 ;; esac',
    'SRC="${SRCROOT}/../node_modules/@gaozh1024/expo-veepoo-sdk/ios/VeepooSDK/Frameworks"',
    'DST="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"',
    'mkdir -p "${DST}"',
    `for fw in ${DYNAMIC_FRAMEWORKS.join(' ')}; do`,
    '  if [ ! -d "${SRC}/${fw}.framework" ]; then echo "warning: VeepooSDK missing ${fw}.framework at ${SRC}"; continue; fi',
    '  rm -rf "${DST}/${fw}.framework"',
    '  cp -RL "${SRC}/${fw}.framework" "${DST}/${fw}.framework"',
    '  rm -rf "${DST}/${fw}.framework/Headers" "${DST}/${fw}.framework/Modules" "${DST}/${fw}.framework/_CodeSignature"',
    '  if [ -n "${EXPANDED_CODE_SIGN_IDENTITY:-}" ]; then',
    '    /usr/bin/codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" "${DST}/${fw}.framework"',
    '  fi',
    '  echo "VeepooSDK: embedded ${fw}.framework"',
    'done',
].join('\n');
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
    config = withVeepooFrameworkEmbed(config);
    config = withAndroidBluetoothPermissions(config);
    return config;
};
// Adds an app-target run-script phase that embeds the device-only dynamic
// frameworks into the .app bundle. Idempotent — safe across repeated prebuilds.
const withVeepooFrameworkEmbed = (config) => {
    return (0, config_plugins_1.withXcodeProject)(config, (config) => {
        // The xcode project model is loosely typed; cast to keep the traversal readable.
        const project = config.modResults;
        const nativeTargets = project.pbxNativeTargetSection();
        let appTargetUuid;
        for (const uuid of Object.keys(nativeTargets)) {
            const target = nativeTargets[uuid];
            if (!target || typeof target !== 'object' || !target.productType)
                continue;
            if (String(target.productType).replace(/"/g, '') ===
                'com.apple.product-type.application') {
                appTargetUuid = uuid;
                break;
            }
        }
        if (!appTargetUuid)
            return config;
        // Skip if the phase already exists (re-runs of prebuild).
        const shellPhases = project.hash.project.objects.PBXShellScriptBuildPhase || {};
        for (const key of Object.keys(shellPhases)) {
            const phase = shellPhases[key];
            if (phase &&
                typeof phase === 'object' &&
                String(phase.name || '').replace(/"/g, '') === EMBED_PHASE_NAME) {
                return config;
            }
        }
        project.addBuildPhase([], 'PBXShellScriptBuildPhase', EMBED_PHASE_NAME, appTargetUuid, { shellPath: '/bin/sh', shellScript: EMBED_SCRIPT });
        return config;
    });
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