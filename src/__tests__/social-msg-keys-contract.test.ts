import { readFileSync } from "fs";
import { join } from "path";

import {
  extractAndroidSocialMsgKeys,
  extractIosSocialMsgKeys,
  verifySocialMsgKeysContract,
} from "@/bridge-contract/verify-social-msg-keys";
import { SOCIAL_MSG_CHANNELS } from "@/capabilities/social-msg";
import { REPO_ROOT as repoRoot } from "./helpers/emitted-device-function-keys";
const kotlinPath = "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleSocialMsgRead.kt";
const kotlinSource = readFileSync(join(repoRoot, kotlinPath), "utf8");
const iosKeys = extractIosSocialMsgKeys(
  readFileSync(join(repoRoot, "ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift"), "utf8"),
);
const androidKeys = extractAndroidSocialMsgKeys(kotlinSource);

describe("social-message key contract", () => {
  it("iOS, Android and SOCIAL_MSG_CHANNELS name the same 13 channels", () => {
    expect(verifySocialMsgKeysContract(repoRoot)).toEqual([]);
  });

  // Guards the extractors themselves: a regex that silently matched nothing
  // would make the check above pass vacuously.
  it("extracts 13 channels from each native emitter", () => {
    expect([...iosKeys.seeded].sort()).toEqual([...SOCIAL_MSG_CHANNELS].sort());
    expect(androidKeys.sort()).toEqual([...SOCIAL_MSG_CHANNELS].sort());
  });

  // iOS seeds every channel "unsupported" and then overwrites it from the ANCS
  // bytes. A channel that is seeded but never assigned reports a constant, which
  // is the #212 defect arrived at from the other side.
  it("iOS decodes a byte for every channel it seeds", () => {
    expect([...iosKeys.assigned].sort()).toEqual([...SOCIAL_MSG_CHANNELS].sort());
  });

  // The vendor's FunctionSocailMsgData fields are all EFunctionStatus. Reading
  // them with a converter that branches on Boolean/Number/String returned a
  // constant "unsupported" for every channel (#212).
  it("Android converts every channel through the enum-aware converter", () => {
    const values = [...kotlinSource.matchAll(/"[^"]+"\s+to\s+(\w+)\(data\./g)].map(
      (match) => match[1],
    );
    expect(values).toHaveLength(SOCIAL_MSG_CHANNELS.length);
    expect(new Set(values)).toEqual(new Set(["toFunctionStatus"]));
  });

  // Nothing above demonstrates the comparison CAN fail — a check that only ever
  // sees agreeing sources proves nothing about what it does when they drift.
  it("reports a channel a platform renamed", () => {
    const drifted = extractAndroidSocialMsgKeys(
      kotlinSource.replace('"whatsapp" to', '"whats_app" to'),
    );
    expect(drifted).toContain("whats_app");
    expect(drifted).not.toContain("whatsapp");
    expect([...SOCIAL_MSG_CHANNELS].filter((key) => !drifted.includes(key))).toEqual(["whatsapp"]);
  });

  it("the enum-blind converter is gone, with no callers left", () => {
    const helpers = readFileSync(
      join(repoRoot, "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt"),
      "utf8",
    );
    expect(helpers).not.toContain("fun toSupportedStatus(");
    expect(kotlinSource).not.toContain("toSupportedStatus(data.");
  });
});
