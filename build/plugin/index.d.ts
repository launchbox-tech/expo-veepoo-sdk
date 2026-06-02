import { ConfigPlugin } from 'expo/config-plugins';
type VeepooSDKPluginProps = {
    bluetoothAlwaysPermission?: string;
    bluetoothPeripheralPermission?: string;
    locationWhenInUsePermission?: string;
};
declare const withVeepooSDK: ConfigPlugin<VeepooSDKPluginProps | void>;
export default withVeepooSDK;
//# sourceMappingURL=index.d.ts.map