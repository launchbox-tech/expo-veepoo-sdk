// Behavioural regression test for VeepooDeviceIdentity (#218).
//
// Compiled and run by scripts/ios-device-identity-check.sh together with
// ios/VeepooSDK/VeepooDeviceIdentity.swift itself — the shipped source, not a
// copy. That file is Foundation-only and carries no `#if targetEnvironment`
// guard precisely so this is possible: no ExpoModulesCore, no vendored
// frameworks, no simulator, ~1s.
//
// Why this exists rather than an XCTest under ios/Tests: that directory is a
// podspec `test_spec` of file-parsing tests that deliberately never link the
// vendored binaries, and nothing in CI runs it. The contract check in
// src/bridge-contract/ proves the emission sites CALL this type; only this
// proves the type DECIDES correctly. #218 called the predicate "the difference
// between a correct fix and a regression", so it gets an executable test.

import Foundation

var failures: [String] = []

func expect(
  _ address: String?,
  mac expectedMac: String?,
  uuid expectedUuid: String?,
  _ why: String
) {
  let actual = VeepooDeviceIdentity.from(deviceAddress: address)
  if actual.mac != expectedMac || actual.uuid != expectedUuid {
    failures.append(
      """
      \(why)
        address:  \(address.map { "\"\($0)\"" } ?? "nil")
        expected: mac=\(expectedMac.map { "\"\($0)\"" } ?? "nil") uuid=\(expectedUuid.map { "\"\($0)\"" } ?? "nil")
        actual:   mac=\(actual.mac.map { "\"\($0)\"" } ?? "nil") uuid=\(actual.uuid.map { "\"\($0)\"" } ?? "nil")
      """)
  }
}

/// Top-level statements are only legal in a `main.swift`, and this file is
/// compiled alongside the module source, so the run lives behind `@main`.
@main
struct DeviceIdentityCheck {
  static func main() {
  // ── The unsettled read: a CBPeripheral UUID must never reach `mac` ──────────
  // Real values from the device trace in #218 (SAILESHBRO iPhone 16 Pro Max).
  expect(
    "6E0E7A2C-1111-4E2F-9C0B-8A4D3F5B7C21",
    mac: nil, uuid: "6E0E7A2C-1111-4E2F-9C0B-8A4D3F5B7C21",
    "an uppercase CBPeripheral UUID belongs in uuid, never in mac")
  expect(
    "6e0e7a2c-1111-4e2f-9c0b-8a4d3f5b7c21",
    mac: nil, uuid: "6e0e7a2c-1111-4e2f-9c0b-8a4d3f5b7c21",
    "UUID(uuidString:) is case-insensitive, so lowercase must divert too")

  // ── The settled read: a genuine MAC must survive untouched ─────────────────
  expect("DB:BC:B7:33:AB:CD", mac: "DB:BC:B7:33:AB:CD", uuid: nil, "a colon-separated MAC is a MAC")
  expect("db:bc:b7:33:ab:cd", mac: "db:bc:b7:33:ab:cd", uuid: nil, "lowercase MAC is still a MAC")
  expect("DBBCB733ABCD", mac: "DBBCB733ABCD", uuid: nil, "a MAC without separators is still a MAC")
  expect("DB-BC-B7-33-AB-CD", mac: "DB-BC-B7-33-AB-CD", uuid: nil, "dash-separated MAC is still a MAC")

  // ── The regression the issue named explicitly ─────────────────────────────
  // Traces contain readies where the scan id IS the hardware MAC, so a
  // `mac == deviceId` rule would null out a good value. The split never looks at
  // the scan id; feeding it the same string it would have compared against must
  // change nothing.
  expect(
    "DB:BC:B7:33:AB:CD",
    mac: "DB:BC:B7:33:AB:CD", uuid: nil,
    "an address identical to the scan id is still published as mac")

  // ── Fall-through: anything unrecognised is a mac, never a silent null ──────
  // The direction that matters. Recognising MACs instead of UUIDs would drop
  // every genuine address format this code has not anticipated.
  expect("not-an-address", mac: "not-an-address", uuid: nil, "an unknown format falls through to mac")
  expect(
    "6E0E7A2C11114E2F9C0B8A4D3F5B7C21",
    mac: "6E0E7A2C11114E2F9C0B8A4D3F5B7C21", uuid: nil,
    "an undashed 32-hex string is not a canonical UUID, so it is not diverted")
  expect(
    "6E0E7A2C-1111-4E2F-9C0B-8A4D3F5B7C2",
    mac: "6E0E7A2C-1111-4E2F-9C0B-8A4D3F5B7C2", uuid: nil,
    "a truncated UUID is not a UUID")

  // ── Absence ───────────────────────────────────────────────────────────────
  expect(nil, mac: nil, uuid: nil, "no address yields neither field")
  expect("", mac: nil, uuid: nil, "an empty address is absence, not an empty-string mac")

  // ── The bridge values ─────────────────────────────────────────────────────
  // A known MAC must reach the payload as the string; an unknown one as NSNull so
  // the key is present and explicitly null rather than quietly missing.
  let settled = VeepooDeviceIdentity.from(deviceAddress: "DB:BC:B7:33:AB:CD")
  if settled.macPayload as? String != "DB:BC:B7:33:AB:CD" {
    failures.append("a settled macPayload must be the MAC string, got \(settled.macPayload)")
  }
  if !(settled.uuidPayload is NSNull) {
    failures.append("an absent uuidPayload must be NSNull, got \(settled.uuidPayload)")
  }
  let unsettled = VeepooDeviceIdentity.from(deviceAddress: "6E0E7A2C-1111-4E2F-9C0B-8A4D3F5B7C21")
  if !(unsettled.macPayload is NSNull) {
    failures.append("an unsettled macPayload must be NSNull, got \(unsettled.macPayload)")
  }
  if unsettled.uuidPayload as? String != "6E0E7A2C-1111-4E2F-9C0B-8A4D3F5B7C21" {
    failures.append("an unsettled uuidPayload must be the UUID string, got \(unsettled.uuidPayload)")
  }

  if failures.isEmpty {
    print("  ✓ VeepooDeviceIdentity: 15 cases")
    exit(0)
  }
  for failure in failures { print("  ✗ \(failure)") }
  print("  \(failures.count) VeepooDeviceIdentity case(s) failed")
  exit(1)
  }
}
