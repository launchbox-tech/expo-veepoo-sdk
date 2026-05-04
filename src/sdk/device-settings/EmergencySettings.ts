import { invokeNative } from "../../bridge/native-invoke-pipeline.js";
import {
  normalizeContactList,
  normalizeSosCallTimesSettings,
} from "../../normalizers/index.js";
import {
  validateNewContact,
  validateContactId,
  validateSosCallTimes,
} from "../../validators/index.js";
import type {
  DeviceContact,
  NewDeviceContact,
  SosCallTimesSettings,
} from "../../types/index.js";
import type { EmergencySettingsInterface, SubsystemRuntime } from "../subsystem-interfaces.js";

/** Emergency settings: contacts and SOS call configuration. */
export class EmergencySettings implements EmergencySettingsInterface {
  constructor(private readonly rt: SubsystemRuntime) {}

  async readContacts(crc?: number): Promise<DeviceContact[]> {
    return invokeNative({
      invoke: () => this.rt.native.readContacts(crc),
      normalize: normalizeContactList,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (contacts: DeviceContact[]) => {
        this.rt.emitLocal("contactsData", {
          deviceId: this.rt.state.connectedDeviceId,
          contacts,
        });
      },
    });
  }

  addContact(contact: NewDeviceContact): Promise<void> {
    return invokeNative({
      validate: () => validateNewContact(contact),
      invoke: () => this.rt.native.addContact(contact),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  deleteContact(contactId: number): Promise<void> {
    return invokeNative({
      validate: () => validateContactId(contactId),
      invoke: () => this.rt.native.deleteContact(contactId),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  setContactSosState(contactId: number, isOpen: boolean): Promise<void> {
    return invokeNative({
      validate: () => validateContactId(contactId),
      invoke: () => this.rt.native.setContactSosState(contactId, isOpen),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }

  async readSosCallTimes(): Promise<SosCallTimesSettings> {
    return invokeNative({
      invoke: () => this.rt.native.readSosCallTimes(),
      normalize: normalizeSosCallTimesSettings,
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
      afterSuccess: (data: SosCallTimesSettings) => {
        this.rt.emitLocal("sosCallTimesData", {
          deviceId: this.rt.state.connectedDeviceId,
          data,
        });
      },
    });
  }

  setSosCallTimes(times: number): Promise<void> {
    return invokeNative({
      validate: () => validateSosCallTimes(times),
      invoke: () => this.rt.native.setSosCallTimes(times),
      fallbackCode: "OPERATION_FAILED",
      deviceId: this.rt.state.connectedDeviceId ?? undefined,
      throwMapped: (e: unknown) => this.rt.nativeOpFailed(e),
    });
  }
}
