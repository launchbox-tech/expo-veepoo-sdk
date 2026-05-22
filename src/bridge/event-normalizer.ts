import type { VeepooEvent, VeepooEventPayload } from '@/types/index';
import { deepSnakeKeys } from '@/shared/deep-keys';
import {
  passthrough,
  type EventNormalizer,
  type PartialEventNormalizers,
} from './event-envelope';

// Capability-owned event slices. Each capability declares the dispatch
// entries for events it produces; the bridge merges them into one table.
// See CONTEXT.md for the envelope / inner-payload split.
import { EVENT_NORMALIZERS as ALARMS_EVENTS } from '@/capabilities/alarms/events';
import { EVENT_NORMALIZERS as BAND_DISCOVERY_EVENTS } from '@/capabilities/band-discovery/events';
import { EVENT_NORMALIZERS as BATTERY_EVENTS } from '@/capabilities/battery/events';
import { EVENT_NORMALIZERS as BT_STATUS_EVENTS } from '@/capabilities/bt-status/events';
import { EVENT_NORMALIZERS as CAMERA_EVENTS } from '@/capabilities/camera/events';
import { EVENT_NORMALIZERS as CONTACTS_EVENTS } from '@/capabilities/contacts/events';
import { EVENT_NORMALIZERS as DEVICE_FUNCTIONS_EVENTS } from '@/capabilities/device-functions/events';
import { EVENT_NORMALIZERS as DEVICE_SWITCHES_EVENTS } from '@/capabilities/device-switches/events';
import { EVENT_NORMALIZERS as DEVICE_VERSION_EVENTS } from '@/capabilities/device-version/events';
import { EVENT_NORMALIZERS as DFU_EVENTS } from '@/capabilities/dfu/events';
import { EVENT_NORMALIZERS as FIND_DEVICE_EVENTS } from '@/capabilities/find-device/events';
import { EVENT_NORMALIZERS as HISTORICAL_QUERY_EVENTS } from '@/capabilities/historical-query/events';
import { EVENT_NORMALIZERS as MUSIC_EVENTS } from '@/capabilities/music/events';
import { EVENT_NORMALIZERS as ORIGIN_DATA_EVENTS } from '@/capabilities/origin-data/events';
import { EVENT_NORMALIZERS as REALTIME_TESTS_EVENTS } from '@/capabilities/realtime-tests/events';
import { EVENT_NORMALIZERS as SESSION_EVENTS } from '@/capabilities/session/events';
import { EVENT_NORMALIZERS as SLEEP_DATA_EVENTS } from '@/capabilities/sleep-data/events';
import { EVENT_NORMALIZERS as SOCIAL_MSG_EVENTS } from '@/capabilities/social-msg/events';
import { EVENT_NORMALIZERS as SOS_EVENTS } from '@/capabilities/sos/events';
import { EVENT_NORMALIZERS as SPORT_MODE_EVENTS } from '@/capabilities/sport-mode/events';
import { EVENT_NORMALIZERS as SPORT_STEPS_EVENTS } from '@/capabilities/sport-steps/events';

// Re-exported so existing tests can still reach the helper.
export { normalizeReadOriginProgressPayload } from '@/capabilities/origin-data/normalizers';

/**
 * Events without a capability owner: SDK-lifecycle (sdk_initialized,
 * scan_started, scan_stopped) and orphan event payloads whose data shape
 * lives in `types/` (custom_settings_data, health_remind_data,
 * apnea_remind_data, error).
 */
const ORPHAN_EVENT_NORMALIZERS = {
  custom_settings_data: passthrough<'custom_settings_data'>(),
  health_remind_data: passthrough<'health_remind_data'>(),
  apnea_remind_data: passthrough<'apnea_remind_data'>(),
  error: passthrough<'error'>(),
  sdk_initialized: () => ({} as VeepooEventPayload['sdk_initialized']),
  scan_started: () => ({} as VeepooEventPayload['scan_started']),
  scan_stopped: () => ({} as VeepooEventPayload['scan_stopped']),
} satisfies PartialEventNormalizers;

/**
 * Typed dispatch table — every `VeepooEvent` key must appear, satisfied
 * either by a capability slice or by ORPHAN_EVENT_NORMALIZERS. TypeScript
 * errors at compile time if a key is missing or a return type is wrong.
 */
const EVENT_NORMALIZERS = {
  ...ALARMS_EVENTS,
  ...BAND_DISCOVERY_EVENTS,
  ...BATTERY_EVENTS,
  ...BT_STATUS_EVENTS,
  ...CAMERA_EVENTS,
  ...CONTACTS_EVENTS,
  ...DEVICE_FUNCTIONS_EVENTS,
  ...DEVICE_SWITCHES_EVENTS,
  ...DEVICE_VERSION_EVENTS,
  ...DFU_EVENTS,
  ...FIND_DEVICE_EVENTS,
  ...HISTORICAL_QUERY_EVENTS,
  ...MUSIC_EVENTS,
  ...ORIGIN_DATA_EVENTS,
  ...REALTIME_TESTS_EVENTS,
  ...SESSION_EVENTS,
  ...SLEEP_DATA_EVENTS,
  ...SOCIAL_MSG_EVENTS,
  ...SOS_EVENTS,
  ...SPORT_MODE_EVENTS,
  ...SPORT_STEPS_EVENTS,
  ...ORPHAN_EVENT_NORMALIZERS,
} satisfies { [K in VeepooEvent]: EventNormalizer<K> };

export function normalizeEventPayload<K extends VeepooEvent>(
  event: K,
  payload: unknown
): VeepooEventPayload[K] {
  return deepSnakeKeys(EVENT_NORMALIZERS[event](payload)) as VeepooEventPayload[K];
}
