import type { CapabilityContext } from "@/capabilities/shared/context";
import type { ContactsNativeMethods } from "./native";
import { normalizeContactList } from "./normalizers";
import { validateNewContact, validateContactId } from "./validators";
import type { DeviceContact, NewDeviceContact } from "@/types/index";
import { deepCamelKeys } from "@/shared/deep-keys";

export class ContactsCapability {
  constructor(private readonly ctx: CapabilityContext<ContactsNativeMethods>) {}

  readContacts(crc?: number): Promise<DeviceContact[]> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readContacts(crc),
      normalize: normalizeContactList,
      afterSuccess: (contacts) => this.ctx.emitDeviceEvent("contacts_data", { contacts }),
    });
  }

  addContact(contact: NewDeviceContact): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateNewContact(contact),
      invoke: () => this.ctx.native.addContact(deepCamelKeys(contact) as NewDeviceContact),
    });
  }

  deleteContact(contactId: number): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateContactId(contactId),
      invoke: () => this.ctx.native.deleteContact(contactId),
    });
  }

  setContactSosState(contactId: number, isOpen: boolean): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateContactId(contactId),
      invoke: () => this.ctx.native.setContactSosState(contactId, isOpen),
    });
  }
}
