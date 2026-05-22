/**
 * Orphan device types: shapes that don't have a single capability owner
 * (event-only payloads, public-API-only types). Capability-owned response
 * shapes live next to their capability under `src/capabilities/<feature>/types.ts`.
 */

/** Generic key/value bag used by the `custom_settings_data` payload. */
export interface CustomSettingData {
  [key: string]: string | number | boolean;
}

/** Generic device-scoped envelope (public API only — kept for compat). */
export interface DeviceData {
  device_id: string;
  data: unknown;
}

/** Reminder type passed to `readHealthReminder` / `setHealthReminder`. */
export type HealthReminderType =
  | 'sedentary'
  | 'drink_water'
  | 'look_far_away'
  | 'sport'
  | 'take_medicine'
  | 'read'
  | 'trip'
  | 'wash_hands';

export interface HealthReminder {
  type: HealthReminderType;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Reminder interval in minutes. */
  interval: number;
  enabled: boolean;
}
