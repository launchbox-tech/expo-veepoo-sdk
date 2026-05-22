import { ALLOWED_NATIVE_REJECT_CODES } from "@/errors/native-rejection-mapping";

import { extractNativeRejectCodes } from "./extract-native-reject-codes";

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
export function verifyNativeRejectionContract(repoRoot: string): string[] {
  const errors: string[] = [];
  const extracted = extractNativeRejectCodes(repoRoot);
  const allowed = new Set<string>(ALLOWED_NATIVE_REJECT_CODES);

  if (extracted.size !== allowed.size) {
    errors.push(
      `Native reject code count: extracted ${extracted.size} vs allowlist ${allowed.size}`,
    );
  }
  for (const c of extracted) {
    if (!allowed.has(c)) {
      errors.push(
        `Native sources emit "${c}" but it is not in ALLOWED_NATIVE_REJECT_CODES — add to src/errors/native-rejection-mapping.ts`,
      );
    }
  }
  for (const c of allowed) {
    if (!extracted.has(c)) {
      errors.push(
        `ALLOWED_NATIVE_REJECT_CODES includes "${c}" but no .reject("…") found — remove stale entry or restore native call`,
      );
    }
  }

  return errors;
}
