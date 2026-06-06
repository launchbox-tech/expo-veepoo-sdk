import type { ConnectOptions } from "../../types/index";
export { validatePersonalInfo } from "../../capabilities/personal-info";
export declare function validateDeviceId(deviceId: unknown): asserts deviceId is string;
export declare function validateConnectOptions(options: ConnectOptions): void;
export declare function validateDeviceName(name: string): void;
export declare function validateConnectionConfirmTimeout(seconds: number): void;
//# sourceMappingURL=validators.d.ts.map