import type { DeviceContact } from "../../types/index.js";
import { isRecord, toInt, toBoolean, toStringValue } from "../../normalizers/primitives.js";

function normalizeContact(raw: unknown): DeviceContact | null {
  if (!isRecord(raw)) return null;
  const name = toStringValue(raw.name ?? raw.nickName);
  const phone_number = toStringValue(raw.phoneNumber ?? raw.phone_number);
  if (!name && !phone_number) return null;
  return {
    contact_id: toInt(raw.contactID ?? raw.contactId ?? raw.contact_id ?? raw.id),
    name,
    phone_number,
    is_sos: toBoolean(raw.isSOS ?? raw.is_sos ?? raw.isSettingSOS),
    is_support_sos:
      (raw.isSupportSOS !== undefined || raw.is_support_sos !== undefined)
        ? toBoolean(raw.isSupportSOS ?? raw.is_support_sos)
        : undefined,
  };
}

export function normalizeContactList(value: unknown): DeviceContact[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const c = normalizeContact(item);
    return c !== null ? [c] : [];
  });
}
