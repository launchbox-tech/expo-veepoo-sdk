import type { NewDeviceContact } from "../../types/index.js";

export interface ContactsNativeMethods {
  readContacts(crc?: number): Promise<unknown>;
  addContact(contact: NewDeviceContact): Promise<void>;
  deleteContact(contactId: number): Promise<void>;
  setContactSosState(contactId: number, isOpen: boolean): Promise<void>;
}
