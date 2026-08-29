import { readFileSync } from "fs";
import { join } from "path";
import { SOCIAL_MSG_CHANNELS } from "@/capabilities/social-msg";
import { NATIVE_SOURCES, sliceBody } from "./native-source";

const SWIFT_PATH = NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = NATIVE_SOURCES.androidFunctionStatus;

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

export type AndroidSocialMsgChannel = {
  /** The key JS reads. */
  key: string;
  /** The Kotlin function the value is passed through. */
  converter: string;
  /** The `FunctionSocailMsgData` field it reads. */
  field: string;
};

/**
 * Android builds the same channels in one `mapOf(...)`, each entry of the shape
 * `"key" to converter(data.field)`.
 *
 * The converter and field are captured, not just the key: #212 was a converter
 * that could not read the vendor's enum and answered a constant, so a check
 * that only collected keys would have watched it happen.
 */
export function extractAndroidSocialMsgChannels(source: string): AndroidSocialMsgChannel[] {
  const body = sliceBody(
    source,
    "fun socialMsgStatusMap(",
    "\n}",
    "Android socialMsgStatusMap",
  );
  return [...body.matchAll(/"([^"]+)"\s+to\s+(\w+)\(\s*data\.(\w+)\s*\)/g)].map((match) => ({
    key: match[1] as string,
    converter: match[2] as string,
    field: match[3] as string,
  }));
}

export function extractAndroidSocialMsgKeys(source: string): string[] {
  return extractAndroidSocialMsgChannels(source).map((channel) => channel.key);
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
  const android = extractAndroidSocialMsgChannels(readFileSync(join(repoRoot, KOTLIN_PATH), "utf8"));
  const sources = [
    ["iOS seed", SWIFT_PATH, ios.seeded],
    ["iOS ANCS decode", SWIFT_PATH, ios.assigned],
    ["Android", KOTLIN_PATH, android.map((channel) => channel.key)],
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

  // Every vendor field is an EFunctionStatus, so every channel must go through
  // the enum-aware converter — and through a field of its own. A literal, a
  // Boolean/Number/String converter, or two channels sharing one field all
  // produce a value that does not track what the band said, which is #212.
  const seenFields = new Map<string, string>();
  for (const { key, converter, field } of android) {
    if (converter !== "toFunctionStatus") {
      errors.push(
        `Android reads ${key} through ${converter}(), not toFunctionStatus() — every ` +
          `FunctionSocailMsgData field is an EFunctionStatus, and a converter that cannot ` +
          `read the enum returns a constant (${KOTLIN_PATH})`,
      );
    }
    const claimed = seenFields.get(field);
    if (claimed) {
      errors.push(
        `Android reads data.${field} for both ${claimed} and ${key} — one of them reports the ` +
          `wrong channel's setting (${KOTLIN_PATH})`,
      );
    } else {
      seenFields.set(field, key);
    }
  }

  return errors;
}
