/** Paths to the native sources the contract checks parse, relative to the repo root. */
export declare const NATIVE_SOURCES: {
    readonly iosReadHelpers: "ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift";
    readonly androidHelpers: "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt";
    readonly androidSocialMsgRead: "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleSocialMsgRead.kt";
};
/**
 * Returns the span of `source` between two literal markers.
 *
 * Throws rather than returning an empty span: a marker that has gone stale
 * means the check is no longer reading what it thinks it is, and a check that
 * silently inspects nothing is the failure mode these checks exist to prevent.
 */
export declare function sliceBody(source: string, start: string, end: string, label: string): string;
//# sourceMappingURL=native-source.d.ts.map