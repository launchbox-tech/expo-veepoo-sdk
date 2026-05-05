import type { NewDeviceContact } from "../../types/index.js";

const CONTACT_NAME_MAX_BYTES = 20;

export function validateNewContact(contact: NewDeviceContact): void {
  if (typeof contact.name !== 'string' || contact.name.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'name is required' };
  }
  if (new TextEncoder().encode(contact.name).byteLength > CONTACT_NAME_MAX_BYTES) {
    throw { code: 'INVALID_ARGUMENT', message: `name must not exceed ${CONTACT_NAME_MAX_BYTES} bytes` };
  }
  const phoneNumber = contact.phone_number ?? (contact as any).phoneNumber;
  if (typeof phoneNumber !== 'string' || phoneNumber.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'phoneNumber is required' };
  }
  if (phoneNumber.trim().length > 20) {
    throw { code: 'INVALID_ARGUMENT', message: 'phoneNumber must not exceed 20 characters' };
  }
}

export function validateContactId(contactId: number): void {
  if (!Number.isInteger(contactId) || contactId < 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'contactId must be a non-negative integer' };
  }
}
