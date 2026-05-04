import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { ContactsNativeMethods } from "./native.js";
import { normalizeContactList } from "./normalizers.js";
import { validateNewContact, validateContactId } from "./validators.js";
import type { DeviceContact, NewDeviceContact } from "../../types/index.js";

export class ContactsCapability {
  constructor(private readonly ctx: CapabilityContext<ContactsNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readContacts(crc?: number): Promise<DeviceContact[]> {
    return this.call({
      invoke: () => this.ctx.native.readContacts(crc),
      normalize: normalizeContactList,
      afterSuccess: (contacts) =>
        this.ctx.emit("contactsData", { deviceId: this.ctx.connectedDeviceId(), contacts }),
    });
  }

  addContact(contact: NewDeviceContact): Promise<void> {
    return this.call({
      validate: () => validateNewContact(contact),
      invoke: () => this.ctx.native.addContact(contact),
    });
  }

  deleteContact(contactId: number): Promise<void> {
    return this.call({
      validate: () => validateContactId(contactId),
      invoke: () => this.ctx.native.deleteContact(contactId),
    });
  }

  setContactSosState(contactId: number, isOpen: boolean): Promise<void> {
    return this.call({
      validate: () => validateContactId(contactId),
      invoke: () => this.ctx.native.setContactSosState(contactId, isOpen),
    });
  }
}
