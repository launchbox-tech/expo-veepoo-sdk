import type { DeviceContact } from "../../types/index.js";
import { isRecord, toInt, toBoolean, toStringValue } from "../../normalizers/primitives.js";

function normalizeContact(raw: unknown): DeviceContact | null {
  if (!isRecord(raw)) return null;
  const name = toStringValue(raw.name ?? raw.nickName);
  const phoneNumber = toStringValue(raw.phoneNumber);
  if (!name && !phoneNumber) return null;
  return {
    contactID: toInt(raw.contactID ?? raw.contactId ?? raw.id),
    name,
    phoneNumber,
    isSOS: toBoolean(raw.isSOS ?? raw.isSettingSOS),
    isSupportSOS:
      raw.isSupportSOS !== undefined ? toBoolean(raw.isSupportSOS) : undefined,
  };
}

export function normalizeContactList(value: unknown): DeviceContact[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const c = normalizeContact(item);
    return c !== null ? [c] : [];
  });
}
