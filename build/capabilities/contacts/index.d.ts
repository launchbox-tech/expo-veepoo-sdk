import type { CapabilityContext } from "../../capabilities/shared/context";
import type { ContactsNativeMethods } from "./native";
import type { DeviceContact, NewDeviceContact } from "../../types/index";
export declare class ContactsCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<ContactsNativeMethods>);
    readContacts(crc?: number): Promise<DeviceContact[]>;
    addContact(contact: NewDeviceContact): Promise<void>;
    deleteContact(contactId: number): Promise<void>;
    setContactSosState(contactId: number, isOpen: boolean): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map