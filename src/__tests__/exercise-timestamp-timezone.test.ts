import { readFileSync } from "fs";
import { join } from "path";

/**
 * Guard for the exercise-session timestamp bug: a `DateFormatter` that renders
 * the band's sport epoch WITHOUT an explicit `timeZone` silently uses
 * `TimeZone.current`, and the band did not encode that epoch in the phone's
 * zone — it used a hard-coded +08:00.
 *
 * Measured against ground truth (rayu.ai#553 follow-up): a workout performed at
 * 06:23:59 local in Asia/Kathmandu arrived as epoch 1788042239, which is
 * 06:23:59 at +08:00 and 04:08:59 at +05:45. Every session therefore landed
 * `08:00 − localOffset` early — 2h15m in Kathmandu, 8h in London, and 0 in
 * China, which is why it went unnoticed upstream.
 *
 * The regression is invisible in review (an ABSENT line, not a wrong one) and
 * invisible on a simulator set to a +08:00 zone, so it is asserted against the
 * source. Same idiom as `native-async-surface.test.ts`.
 */
const SOURCE = join(__dirname, "..", "..", "ios/VeepooSDK/VeepooSDKModule+Exercise.swift");
const source = readFileSync(SOURCE, "utf8");

/** Body of `exerciseTimestampString`, the one epoch → wall-clock conversion. */
const converter = (() => {
  const start = source.indexOf("private func exerciseTimestampString");
  expect(start).toBeGreaterThan(-1);
  const end = source.indexOf("\n  }", start);
  return source.slice(start, end);
})();

describe("exerciseTimestampString", () => {
  it("pins the formatter's timeZone instead of inheriting TimeZone.current", () => {
    expect(converter).toMatch(/formatter\.timeZone\s*=/);
  });

  it("reads the band's epoch back at +08:00, the offset the band encoded it with", () => {
    // Accept either the literal or the named constant, but require that the
    // constant itself resolves to 8 hours.
    const named = /formatter\.timeZone\s*=\s*Self\.bandEpochTimeZone/.test(converter);
    if (named) {
      expect(source).toMatch(/bandEpochTimeZone\s*=\s*TimeZone\(secondsFromGMT:\s*8\s*\*\s*3600\)/);
    } else {
      expect(converter).toMatch(
        /formatter\.timeZone\s*=\s*TimeZone\((secondsFromGMT:\s*8\s*\*\s*3600|identifier:\s*"Asia\/Shanghai")/,
      );
    }
  });

  it("still pins the POSIX locale, which the timezone fix must not displace", () => {
    expect(converter).toMatch(/formatter\.locale\s*=\s*Locale\(identifier:\s*"en_US_POSIX"\)/);
  });
});

describe("the string-passthrough exercise parsers stay passthrough", () => {
  it("does not reformat the vendor's already-local datetime strings", () => {
    // `parseSportModel` / `parseRunningDict` receive a wall-clock STRING the
    // band already expressed in the phone's zone. Routing either through a
    // formatter would reintroduce the same class of bug from the other side.
    const start = source.indexOf("private func exerciseDateString");
    expect(start).toBeGreaterThan(-1);
    const body = source.slice(start, source.indexOf("\n  }", start));
    expect(body).not.toMatch(/DateFormatter|TimeZone|Calendar/);
  });
});
