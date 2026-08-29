import Foundation

/// Splits the vendor's `deviceAddress` into the two identities that
/// `device_ready` publishes as separate fields.
///
/// `VPPeripheralModel.deviceAddress` is documented as unstable across password
/// verification — 设备地址，密码验证成功之后可能会改变 ("may change after
/// successful verification"). Before it settles it holds the iOS CBPeripheral
/// UUID; afterwards, the hardware MAC. The vendor re-sends the password on
/// every service discovery and re-invokes its result block each time, so a
/// single verify emits `DEVICE_READY` more than once and reads the address at
/// both ends of that transition. Publishing it unconditionally as `mac` made
/// the field a UUID roughly 40% of the time (#218).
///
/// The split keys on the *shape* of the address, and it is deliberately
/// one-directional: only a canonical 8-4-4-4-12 UUID is diverted to `uuid`, and
/// anything else — including an address format this code has never seen — falls
/// through as `mac`. Recognising MACs instead would null out every genuine
/// value the recogniser failed to anticipate, which is a worse bug than the one
/// being fixed.
///
/// This file is Foundation-only and carries no `#if targetEnvironment`
/// guard on purpose: the emission sites it serves are device-only, so the
/// simulator build would otherwise never type-check it.
struct VeepooDeviceIdentity {
  /// The hardware MAC, or nil when the address had not settled yet.
  let mac: String?
  /// The CBPeripheral UUID, or nil once the address has settled to a MAC.
  let uuid: String?

  /// True only for the canonical dashed UUID form. A MAC — with colons,
  /// without, of any length — is not one, and neither is an empty string.
  static func isPeripheralUuid(_ value: String) -> Bool {
    UUID(uuidString: value) != nil
  }

  static func from(deviceAddress: String?) -> VeepooDeviceIdentity {
    guard let address = deviceAddress, !address.isEmpty else {
      return VeepooDeviceIdentity(mac: nil, uuid: nil)
    }
    return isPeripheralUuid(address)
      ? VeepooDeviceIdentity(mac: nil, uuid: address)
      : VeepooDeviceIdentity(mac: address, uuid: nil)
  }

  /// `mac` as an event-payload value: the string, or JS `null`.
  ///
  /// `NSNull` rather than a nil `Any?`, so the key is present and explicitly
  /// null on the JS side. Absence is not a value, but it should be a *visible*
  /// one — a consumer reading `payload.mac` must be able to see that the MAC is
  /// unknown rather than find the field quietly missing.
  var macPayload: Any { Self.payload(mac) }

  /// `uuid` as an event-payload value: the string, or JS `null`.
  var uuidPayload: Any { Self.payload(uuid) }

  private static func payload(_ value: String?) -> Any {
    if let value = value { return value }
    return NSNull()
  }
}
