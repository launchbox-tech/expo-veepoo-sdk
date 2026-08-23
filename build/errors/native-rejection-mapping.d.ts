/**
 * Flat per-native-code mapping driving {@link mapNativeRejection} (ADR 0003).
 *
 * Each entry maps a SCREAMING_SNAKE native rejection code to its public
 * `VeepooErrorCode`. The runtime rule is documented in CONTEXT.md:
 *   `native_code` is emitted on the resulting `VeepooError` iff the public
 *   `code` differs from the native rejection key (after trim/case normalization).
 *
 * Keep the table grouped by relationship for readability:
 *   - direct:    public code === native code
 *   - alias:     different public code (native_code emitted)
 *   - collapse:  mapped into a public bucket (native_code emitted)
 *
 * Codes that are present in native sources but absent from this table fall
 * through to `OPERATION_FAILED` with `native_code = <code>` (see
 * {@link ALLOWED_NATIVE_REJECT_CODES} for the audit allowlist).
 */
export declare const NATIVE_REJECT_MAPPING: {
    readonly BLUETOOTH_NOT_ENABLED: {
        readonly code: "BLUETOOTH_NOT_ENABLED";
    };
    readonly CAPABILITY_UNSUPPORTED: {
        readonly code: "CAPABILITY_UNSUPPORTED";
    };
    readonly CONNECTION_FAILED: {
        readonly code: "CONNECTION_FAILED";
    };
    readonly DEVICE_BUSY: {
        readonly code: "DEVICE_BUSY";
    };
    readonly DEVICE_NOT_CONNECTED: {
        readonly code: "DEVICE_NOT_CONNECTED";
    };
    readonly DEVICE_NOT_FOUND: {
        readonly code: "DEVICE_NOT_FOUND";
    };
    readonly DEVICE_NOT_READY: {
        readonly code: "DEVICE_NOT_READY";
    };
    readonly DISCONNECTION_FAILED: {
        readonly code: "DISCONNECTION_FAILED";
    };
    readonly INVALID_ARGUMENT: {
        readonly code: "INVALID_ARGUMENT";
    };
    readonly INVALID_CONNECT_ID: {
        readonly code: "INVALID_CONNECT_ID";
    };
    readonly NOT_WEARING: {
        readonly code: "NOT_WEARING";
    };
    readonly OPERATION_FAILED: {
        readonly code: "OPERATION_FAILED";
    };
    readonly PASSWORD_REQUIRED: {
        readonly code: "PASSWORD_REQUIRED";
    };
    readonly PERMISSION_DENIED: {
        readonly code: "PERMISSION_DENIED";
    };
    readonly REALTIME_TEST_IN_PROGRESS: {
        readonly code: "REALTIME_TEST_IN_PROGRESS";
    };
    readonly SDK_NOT_INITIALIZED: {
        readonly code: "SDK_NOT_INITIALIZED";
    };
    readonly TIMEOUT: {
        readonly code: "TIMEOUT";
    };
    readonly UNKNOWN: {
        readonly code: "UNKNOWN";
    };
    readonly DISCONNECT_ERROR: {
        readonly code: "DISCONNECTION_FAILED";
    };
    readonly DISCONNECT_FAILED: {
        readonly code: "DISCONNECTION_FAILED";
    };
    readonly SDK_NOT_AVAILABLE: {
        readonly code: "SDK_NOT_INITIALIZED";
    };
    readonly READ_FAILED: {
        readonly code: "OPERATION_FAILED";
    };
    readonly START_FAILED: {
        readonly code: "OPERATION_FAILED";
    };
    readonly STOP_FAILED: {
        readonly code: "OPERATION_FAILED";
    };
    readonly INVALID_LANGUAGE: {
        readonly code: "INVALID_ARGUMENT";
    };
    readonly INVALID_TYPE: {
        readonly code: "INVALID_ARGUMENT";
    };
    readonly PASSWORD_TYPE_ERROR: {
        readonly code: "INVALID_ARGUMENT";
    };
};
/**
 * Audit allowlist: every native code that appears in `.reject("CODE"` calls
 * across `android/src/main/kotlin/expo/modules/veepoo` and `ios/VeepooSDK`.
 *
 * Includes both mapped codes (keys of {@link NATIVE_REJECT_MAPPING}) and
 * intentional-fallthrough codes that natively exist but rely on the
 * `mapNativeRejection` default of `OPERATION_FAILED` + `native_code`.
 * The verifier (`verifyNativeRejectionContract`) cross-checks this against
 * a live regex scan of native sources.
 */
export declare const ALLOWED_NATIVE_REJECT_CODES: readonly ["BLUETOOTH_NOT_ENABLED", "BLUETOOTH_UNAVAILABLE", "CAPABILITY_UNSUPPORTED", "CMD_FAILED", "CONNECTION_FAILED", "CONNECTION_TIMEOUT", "CONNECTION_CONFIRM_TIMEOUT", "CONTEXT_ERROR", "DEVICE_DISCONNECTED", "DEVICE_NOT_CONNECTED", "DEVICE_NOT_FOUND", "DEVICE_NOT_READY", "DISCONNECT_ERROR", "DISCONNECT_FAILED", "INIT_ERROR", "INVALID_ACTIVITY", "INVALID_ARGUMENT", "INVALID_CONNECT_ID", "INVALID_LANGUAGE", "INVALID_TYPE", "MODIFY_FAILED", "NO_ACTIVITY", "OPERATION_FAILED", "PASSWORD_TYPE_ERROR", "PERMISSION_DENIED", "PERMISSION_ERROR", "READ_FAILED", "REALTIME_TEST_IN_PROGRESS", "SCAN_ERROR", "SDK_NOT_AVAILABLE", "SDK_NOT_INITIALIZED", "SET_FAILED", "SET_LANGUAGE_FAILED", "START_FAILED", "STOP_FAILED", "SYNC_FAILED", "TIMEOUT", "TYPE_NOT_FOUND", "UNKNOWN", "UNSUPPORTED"];
/**
 * Exhaustive list of public `VeepooErrorCode` values for runtime checks
 * (e.g. {@link isVeepooErrorShape}). Compile-time exhaustiveness is enforced
 * via the `Exhaustive` assertion below — if a member is added to or removed
 * from `VeepooErrorCode`, this array must be updated or `tsc` fails.
 */
export declare const VEEPOO_CODES: readonly ["UNKNOWN", "INVALID_ARGUMENT", "INVALID_CONNECT_ID", "PERMISSION_DENIED", "CONNECTION_FAILED", "DISCONNECTION_FAILED", "BLUETOOTH_NOT_ENABLED", "DEVICE_NOT_FOUND", "OPERATION_FAILED", "SDK_NOT_INITIALIZED", "DEVICE_NOT_CONNECTED", "DEVICE_NOT_READY", "REALTIME_TEST_IN_PROGRESS", "CAPABILITY_UNSUPPORTED", "DEVICE_BUSY", "PASSWORD_REQUIRED", "TIMEOUT", "NOT_WEARING"];
//# sourceMappingURL=native-rejection-mapping.d.ts.map