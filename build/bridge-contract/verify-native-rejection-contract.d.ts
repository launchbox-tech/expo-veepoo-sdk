/**
 * Verify the native rejection bridge contract (ADR 0003).
 *
 * Cross-checks {@link ALLOWED_NATIVE_REJECT_CODES} (the audit allowlist of
 * native codes we have explicitly OK'd) against a live regex scan of native
 * source files in `android/src/main/kotlin/expo/modules/veepoo` and
 * `ios/VeepooSDK`. Mapping entries in `NATIVE_REJECT_MAPPING` may include
 * forward-looking direct entries (public codes native does not currently
 * emit but we are prepared to pass through if it ever does) — those are not
 * required to appear in the allowlist.
 *
 * Returns an array of human-readable error messages (empty when the contract
 * holds). The legacy bucket-mutex checks are gone — by construction, a code
 * has exactly one entry in `NATIVE_REJECT_MAPPING`.
 */
export declare function verifyNativeRejectionContract(repoRoot: string): string[];
//# sourceMappingURL=verify-native-rejection-contract.d.ts.map