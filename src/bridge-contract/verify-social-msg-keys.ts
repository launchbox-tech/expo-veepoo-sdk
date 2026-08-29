import { readFileSync } from "fs";
import { join } from "path";
import { SOCIAL_MSG_CHANNELS } from "@/capabilities/social-msg";
import { NATIVE_SOURCES, sliceBody } from "./native-source";

const SWIFT_PATH = NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = NATIVE_SOURCES.androidFunctionStatus;
const EMITTER_PATH = NATIVE_SOURCES.androidSocialMsgRead;

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
 * Fails when `readSocialMsgData` stops handing JS what [socialMsgStatusMap]
 * built.
 *
 * The channel rules below read the mapper's file. That file is not the one
 * #212 was filed against — the emitter is, and an emitter that builds its own
 * map reproduces the defect with the mapper sitting correct and untouched
 * beside it. So the emitter is held to delegating: one `socialMsgStatusMap(data)`
 * call, resolved and emitted verbatim, and not a channel key of its own.
 */
export function verifyAndroidEmitterDelegates(source: string): string[] {
  const errors: string[] = [];
  const body = sliceBody(
    source,
    'AsyncFunction("readSocialMsgData")',
    'promise.reject("READ_FAILED"',
    "Android readSocialMsgData",
  );

  const built = [...body.matchAll(/val\s+result\s*=\s*(\w+)\(\s*data\s*\)/g)].map(
    (match) => match[1] as string,
  );
  if (built.length !== 1 || built[0] !== "socialMsgStatusMap") {
    errors.push(
      `Android readSocialMsgData must build its result from exactly one ` +
        `socialMsgStatusMap(data) call — found [${built.join(", ") || "none"}] (${EMITTER_PATH})`,
    );
  }

  const inlined = [...SOCIAL_MSG_CHANNELS].filter((channel) => body.includes(`"${channel}"`));
  if (inlined.length) {
    errors.push(
      `Android readSocialMsgData names the channels [${inlined.join(", ")}] itself — a map built ` +
        `here bypasses socialMsgStatusMap and the check that runs it (${EMITTER_PATH})`,
    );
  }

  for (const required of ["promise.resolve(result)", '"data" to result']) {
    if (!body.includes(required)) {
      errors.push(
        `Android readSocialMsgData no longer passes the mapped result on verbatim — ` +
          `expected \`${required}\` (${EMITTER_PATH})`,
      );
    }
  }

  return errors;
}

/**
 * Fails when a channel's value would stop tracking what the band said.
 *
 * Every vendor field is an `EFunctionStatus`, so every channel must go through
 * the enum-aware converter — and through a field of its own. A literal, a
 * Boolean/Number/String converter, or two channels sharing one field all
 * produce a value independent of the input, which is #212.
 *
 * Exported so the test can drive this rule rather than restate it: a rule a
 * test reimplements is a rule that stays green after you delete it.
 */
export function verifyAndroidChannelWiring(channels: AndroidSocialMsgChannel[]): string[] {
  const errors: string[] = [];
  const seenFields = new Map<string, string>();
  for (const { key, converter, field } of channels) {
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

  errors.push(...verifyAndroidChannelWiring(android));
  errors.push(...verifyAndroidEmitterDelegates(readFileSync(join(repoRoot, EMITTER_PATH), "utf8")));

  return errors;
}
