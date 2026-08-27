import { readFileSync } from "fs";
import { join } from "path";
import { SOCIAL_MSG_CHANNELS } from "@/capabilities/social-msg";
import { NATIVE_SOURCES, sliceBody } from "./native-source";

const SWIFT_PATH = NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = NATIVE_SOURCES.androidSocialMsgRead;

export type IosSocialMsgKeys = {
  /** Channels in the "all unsupported" dictionary the function starts from. */
  seeded: string[];
  /** Channels actually assigned a decoded ANCS byte afterwards. */
  assigned: string[];
};

/**
 * iOS seeds every channel as "unsupported", then overwrites each from the ANCS
 * bytes. Both halves are extracted: a channel that is seeded but never assigned
 * reports a constant "unsupported" — the same silent-constant defect as #212,
 * just reached a different way.
 */
export function extractIosSocialMsgKeys(source: string): IosSocialMsgKeys {
  const body = sliceBody(
    source,
    "func parseSocialMsgData(",
    // The function's own final `return result`, on its own line — NOT the
    // early `guard … else { return result }`, which precedes the assignments.
    "\n    return result\n",
    "iOS parseSocialMsgData",
  );
  const seedLiteral = sliceBody(body, "var result:", "guard ancsData.count", "iOS seed literal");
  return {
    seeded: [...seedLiteral.matchAll(/"([^"]+)"\s*:/g)].map((match) => match[1] as string),
    assigned: [...body.matchAll(/\bresult\["([^"]+)"\]\s*=/g)].map((match) => match[1] as string),
  };
}

/** Android builds the same channels in one `mapOf(...)`. */
export function extractAndroidSocialMsgKeys(source: string): string[] {
  const body = sliceBody(
    source,
    "val result = mapOf(",
    "module.sendEvent(",
    "Android readSocialMsgData",
  );
  return [...body.matchAll(/"([^"]+)"\s+to\b/g)].map((match) => match[1] as string);
}

/**
 * Fails when the social-message channel names drift between the two native
 * emitters and the JS list that reads them.
 *
 * Keys only. The platforms legitimately differ on VALUES — iOS decodes ANCS
 * bytes and never reports "support", while Android maps the vendor enum and
 * can report "support" or "unknown". All are valid `FunctionStatus`.
 *
 * The vendor struct carries 26 channels and both platforms bridge 13; that
 * asymmetry is deliberate scope, so the vendor is not part of the comparison.
 */
export function verifySocialMsgKeysContract(repoRoot: string): string[] {
  const errors: string[] = [];
  const expected: string[] = [...SOCIAL_MSG_CHANNELS].sort();

  const ios = extractIosSocialMsgKeys(readFileSync(join(repoRoot, SWIFT_PATH), "utf8"));
  const sources = [
    ["iOS seed", SWIFT_PATH, ios.seeded],
    ["iOS ANCS decode", SWIFT_PATH, ios.assigned],
    [
      "Android",
      KOTLIN_PATH,
      extractAndroidSocialMsgKeys(readFileSync(join(repoRoot, KOTLIN_PATH), "utf8")),
    ],
  ] as const;

  for (const [platform, path, keys] of sources) {
    const missing = expected.filter((key) => !keys.includes(key));
    const extra = [...keys].sort().filter((key) => !expected.includes(key));
    if (missing.length || extra.length) {
      errors.push(
        `${platform} social-message channels disagree with SOCIAL_MSG_CHANNELS — ` +
          `missing: [${missing.join(", ")}], unexpected: [${extra.join(", ")}] (${path})`,
      );
    }
  }

  return errors;
}
