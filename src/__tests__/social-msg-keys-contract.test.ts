import { readFileSync } from "fs";
import { join } from "path";

import { NATIVE_SOURCES } from "@/bridge-contract/native-source";
import {
  extractAndroidSocialMsgChannels,
  extractAndroidSocialMsgKeys,
  extractIosSocialMsgKeys,
  verifyAndroidChannelWiring,
  verifyAndroidEmitterDelegates,
  verifySocialMsgKeysContract,
} from "@/bridge-contract/verify-social-msg-keys";
import { SOCIAL_MSG_CHANNELS } from "@/capabilities/social-msg";
import { REPO_ROOT as repoRoot } from "./helpers/emitted-device-function-keys";
const kotlinPath = NATIVE_SOURCES.androidFunctionStatus;
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
    const channels = extractAndroidSocialMsgChannels(kotlinSource);
    expect(channels).toHaveLength(SOCIAL_MSG_CHANNELS.length);
    expect(new Set(channels.map((channel) => channel.converter))).toEqual(
      new Set(["toFunctionStatus"]),
    );
  });

  // Thirteen channels reading thirteen fields. Two channels sharing one field
  // would make one of them report a setting the user never touched — the same
  // "the value does not track the band" failure as #212, one channel at a time.
  it("Android gives every channel a vendor field of its own", () => {
    const fields = extractAndroidSocialMsgChannels(kotlinSource).map((channel) => channel.field);
    expect(new Set(fields).size).toBe(SOCIAL_MSG_CHANNELS.length);
  });

  it.each([
    [
      "a channel converted by something that cannot read the enum",
      '"phone" to toSupportedStatus(data.phone)',
      /through toSupportedStatus\(\)/,
    ],
    [
      "two channels sharing one vendor field",
      '"phone" to toFunctionStatus(data.other)',
      /data\.other for both/,
    ],
  ])("the converter contract reports %s", (_label, replacement, expected) => {
    // The shipped rule, driven over a drifted extraction — not a copy of it.
    // Feeding the real function is the whole point: a restated rule keeps
    // passing after the one that runs in CI is deleted.
    const drifted = extractAndroidSocialMsgChannels(
      kotlinSource.replace('"phone" to toFunctionStatus(data.phone)', replacement),
    );
    expect(verifyAndroidChannelWiring(drifted).join("\n")).toMatch(expected);
  });

  it("passes the shipped wiring it is asked to judge", () => {
    expect(verifyAndroidChannelWiring(extractAndroidSocialMsgChannels(kotlinSource))).toEqual([]);
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

  // The mapper's file is not the one #212 was filed against. An emitter that
  // builds its own map reproduces the defect with the mapper sitting correct
  // and untouched beside it, so the emitter is held to delegating.
  describe("the emitter hands JS what the mapper built", () => {
    const emitterSource = readFileSync(join(repoRoot, NATIVE_SOURCES.androidSocialMsgRead), "utf8");

    it("passes on the shipped emitter", () => {
      expect(verifyAndroidEmitterDelegates(emitterSource)).toEqual([]);
    });

    it.each([
      [
        "an emitter that builds its own map",
        "val result = socialMsgStatusMap(data)",
        'val result = mapOf("phone" to "unsupported", "sms" to "unsupported")',
        /must build its result from exactly one socialMsgStatusMap\(data\) call/,
      ],
      [
        "an emitter that names channels itself",
        "val result = socialMsgStatusMap(data)",
        'val result = socialMsgStatusMap(data) + ("phone" to "open")',
        /names the channels \[phone\] itself/,
      ],
      [
        "an emitter that resolves something else",
        "promise.resolve(result)",
        "promise.resolve(emptyMap<String, String>())",
        /no longer passes the mapped result on verbatim/,
      ],
    ])("reports %s", (_label, from, to, expected) => {
      expect(verifyAndroidEmitterDelegates(emitterSource.replace(from, to)).join("\n")).toMatch(
        expected,
      );
    });
  });

  it("the enum-blind converter is gone, with no callers left", () => {
    const helpers = readFileSync(join(repoRoot, NATIVE_SOURCES.androidHelpers), "utf8");
    const readPath = readFileSync(join(repoRoot, NATIVE_SOURCES.androidSocialMsgRead), "utf8");
    expect(helpers).not.toContain("fun toSupportedStatus(");
    expect(kotlinSource).not.toContain("fun toSupportedStatus(");
    expect(readPath).not.toContain("toSupportedStatus(data.");
  });

  // The mappers are compiled and RUN against the vendor's own enum by
  // scripts/android-function-status-check.sh. That is only possible while the
  // file imports the two vendor types and nothing else — an Android or
  // ExpoModulesCore import here would leave them with no executable test.
  it("the mapper file stays compilable on its own", () => {
    const imports = [...kotlinSource.matchAll(/^import\s+(\S+)/gm)].map((match) => match[1]);
    expect(imports).toEqual([
      "com.veepoo.protocol.model.datas.FunctionSocailMsgData",
      "com.veepoo.protocol.model.enums.EFunctionStatus",
    ]);
  });
});
