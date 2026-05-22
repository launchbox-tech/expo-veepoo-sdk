/** A contact entry stored on the Band. Android `Contact`; iOS `VPDeviceContactsModel`. */
export interface DeviceContact {
  contact_id: number;
  /** Display name — vendor limit: 20 bytes UTF-8. */
  name: string;
  phone_number: string;
  /** Whether this contact is marked as an SOS (emergency) contact. */
  is_sos: boolean;
  /** Whether the Band supports designating this contact as SOS. Android-only; may be absent on iOS. */
  is_support_sos?: boolean;
}

/** Payload for `addContact` — the Band assigns the `contact_id`. */
export interface NewDeviceContact {
  name: string;
  phone_number: string;
  /** Mark as SOS on add; defaults to false. */
  is_sos?: boolean;
}
