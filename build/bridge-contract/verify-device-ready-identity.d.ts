/** Repo-relative paths of the iOS sources that emit `DEVICE_READY`. */
export declare function findEmittingSources(repoRoot: string): string[];
/**
 * Every `DEVICE_READY` emission in the sources above, including the simulator
 * stubs. A drop below this means an emission site was renamed or removed and
 * the check is no longer reading what it thinks it is.
 */
export declare const EXPECTED_EMISSION_COUNT = 4;
/** How many of those emissions publish device identity (`mac`). */
export declare const EXPECTED_IDENTITY_EMISSION_COUNT = 2;
export type DeviceReadyEmission = {
    /** Repo-relative path of the file the emission was read from. */
    file: string;
    /** 1-based line of the `sendEvent(DEVICE_READY` call. */
    line: number;
    /** Payload key -> the Swift expression assigned to it, verbatim. */
    keys: Map<string, string>;
};
/**
 * Pulls each `sendEvent(DEVICE_READY, [...])` dictionary literal out of a Swift
 * source. Bracket-balanced from the `[` that opens the payload so a nested
 * literal (`"data": [...]`) cannot end the span early.
 */
export declare function extractDeviceReadyEmissions(source: string, file: string): DeviceReadyEmission[];
/**
 * #218: `deviceAddress` holds the CBPeripheral UUID until password verification
 * settles it, so publishing it straight into a field named `mac` makes the
 * event lie roughly 40% of the time. Every identity-carrying emission must
 * route the address through `VeepooDeviceIdentity`, which sorts it into `mac`
 * or `uuid`, and must publish both fields so a consumer can tell them apart.
 */
export declare function verifyDeviceReadyIdentityContract(repoRoot: string): string[];
/** The payload half of the contract, over already-parsed emissions. */
export declare function verifyDeviceReadyPayloads(emissions: DeviceReadyEmission[]): string[];
//# sourceMappingURL=verify-device-ready-identity.d.ts.map