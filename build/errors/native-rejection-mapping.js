"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VEEPOO_CODES = exports.ALLOWED_NATIVE_REJECT_CODES = exports.NATIVE_REJECT_MAPPING = void 0;
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
exports.NATIVE_REJECT_MAPPING = {
    // ── direct (native code === public code) ─────────────────────────────────
    BLUETOOTH_NOT_ENABLED: { code: "BLUETOOTH_NOT_ENABLED" },
    CAPABILITY_UNSUPPORTED: { code: "CAPABILITY_UNSUPPORTED" },
    CONNECTION_FAILED: { code: "CONNECTION_FAILED" },
    DEVICE_BUSY: { code: "DEVICE_BUSY" },
    DEVICE_NOT_CONNECTED: { code: "DEVICE_NOT_CONNECTED" },
    DEVICE_NOT_FOUND: { code: "DEVICE_NOT_FOUND" },
    DEVICE_NOT_READY: { code: "DEVICE_NOT_READY" },
    DISCONNECTION_FAILED: { code: "DISCONNECTION_FAILED" },
    INVALID_ARGUMENT: { code: "INVALID_ARGUMENT" },
    // iOS only: the connect id is not a CBPeripheral UUID, so it can never
    // resolve. Distinct from DEVICE_NOT_FOUND (a band that is merely absent) —
    // this one will fail forever until the pairing is rewritten.
    INVALID_CONNECT_ID: { code: "INVALID_CONNECT_ID" },
    NOT_WEARING: { code: "NOT_WEARING" },
    OPERATION_FAILED: { code: "OPERATION_FAILED" },
    PASSWORD_REQUIRED: { code: "PASSWORD_REQUIRED" },
    PERMISSION_DENIED: { code: "PERMISSION_DENIED" },
    REALTIME_TEST_IN_PROGRESS: { code: "REALTIME_TEST_IN_PROGRESS" },
    SDK_NOT_INITIALIZED: { code: "SDK_NOT_INITIALIZED" },
    TIMEOUT: { code: "TIMEOUT" },
    UNKNOWN: { code: "UNKNOWN" },
    // ── alias (different public code, native_code emitted) ───────────────────
    DISCONNECT_ERROR: { code: "DISCONNECTION_FAILED" },
    DISCONNECT_FAILED: { code: "DISCONNECTION_FAILED" },
    SDK_NOT_AVAILABLE: { code: "SDK_NOT_INITIALIZED" },
    // ── collapse (mapped to bucket, native_code emitted) ─────────────────────
    READ_FAILED: { code: "OPERATION_FAILED" },
    START_FAILED: { code: "OPERATION_FAILED" },
    STOP_FAILED: { code: "OPERATION_FAILED" },
    INVALID_LANGUAGE: { code: "INVALID_ARGUMENT" },
    INVALID_TYPE: { code: "INVALID_ARGUMENT" },
    PASSWORD_TYPE_ERROR: { code: "INVALID_ARGUMENT" },
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
exports.ALLOWED_NATIVE_REJECT_CODES = [
    "BLUETOOTH_NOT_ENABLED",
    "BLUETOOTH_UNAVAILABLE",
    "CAPABILITY_UNSUPPORTED",
    "CMD_FAILED",
    "CONNECTION_FAILED",
    "CONNECTION_TIMEOUT",
    "CONNECTION_CONFIRM_TIMEOUT",
    "CONTEXT_ERROR",
    "DEVICE_DISCONNECTED",
    "DEVICE_NOT_CONNECTED",
    "DEVICE_NOT_FOUND",
    "DEVICE_NOT_READY",
    "DISCONNECT_ERROR",
    "DISCONNECT_FAILED",
    "INIT_ERROR",
    "INVALID_ACTIVITY",
    "INVALID_ARGUMENT",
    "INVALID_CONNECT_ID",
    "INVALID_LANGUAGE",
    "INVALID_TYPE",
    "MODIFY_FAILED",
    "NO_ACTIVITY",
    "OPERATION_FAILED",
    "PASSWORD_TYPE_ERROR",
    "PERMISSION_DENIED",
    "PERMISSION_ERROR",
    "READ_FAILED",
    "REALTIME_TEST_IN_PROGRESS",
    "SCAN_ERROR",
    "SDK_NOT_AVAILABLE",
    "SDK_NOT_INITIALIZED",
    "SET_FAILED",
    "SET_LANGUAGE_FAILED",
    "START_FAILED",
    "STOP_FAILED",
    "SYNC_FAILED",
    "TIMEOUT",
    "TYPE_NOT_FOUND",
    "UNKNOWN",
    "UNSUPPORTED",
];
/**
 * Exhaustive list of public `VeepooErrorCode` values for runtime checks
 * (e.g. {@link isVeepooErrorShape}). Compile-time exhaustiveness is enforced
 * via the `Exhaustive` assertion below — if a member is added to or removed
 * from `VeepooErrorCode`, this array must be updated or `tsc` fails.
 */
exports.VEEPOO_CODES = [
    "UNKNOWN",
    "INVALID_ARGUMENT",
    "INVALID_CONNECT_ID",
    "PERMISSION_DENIED",
    "CONNECTION_FAILED",
    "DISCONNECTION_FAILED",
    "BLUETOOTH_NOT_ENABLED",
    "DEVICE_NOT_FOUND",
    "OPERATION_FAILED",
    "SDK_NOT_INITIALIZED",
    "DEVICE_NOT_CONNECTED",
    "DEVICE_NOT_READY",
    "REALTIME_TEST_IN_PROGRESS",
    "CAPABILITY_UNSUPPORTED",
    "DEVICE_BUSY",
    "PASSWORD_REQUIRED",
    "TIMEOUT",
    "NOT_WEARING",
];
const _exhaustive = true;
void _exhaustive;
//# sourceMappingURL=native-rejection-mapping.js.map