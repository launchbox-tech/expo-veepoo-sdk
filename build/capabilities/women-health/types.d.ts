/** Vendor `EWomenStatus` / `VPDeviceFemaleState` (physiology mode, not user sex). */
export type WomenHealthStatus = 'none' | 'menstrual' | 'pregnancy_prep' | 'pregnancy' | 'postpartum';
export type WomenHealthBabySex = 'female' | 'male';
/** Women's health / cycle settings. Android `WomenSetting` / `WomenData`; iOS `VPDeviceFemaleModel`. */
export interface WomenHealthSettings {
    status: WomenHealthStatus;
    /** Menstrual length in days (vendor range typically 4–28). */
    menstrual_length_days?: number;
    menstrual_cycle_days?: number;
    /** Calendar date `yyyy-MM-dd`. */
    last_menstrual_date?: string;
    expected_delivery_date?: string;
    baby_birthday?: string;
    baby_sex?: WomenHealthBabySex;
    /** Some Bands report current-cycle day count on read. */
    current_menstrual_days?: number;
    /** Android-only: `EWomenOprateStatus` name when present. */
    operation_status?: string;
}
//# sourceMappingURL=types.d.ts.map