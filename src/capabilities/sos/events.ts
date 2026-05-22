import { passthrough, wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeSosCallTimesSettings } from './normalizers';

export const EVENT_NORMALIZERS = {
  sos_call_times_data: wrapInner('data', normalizeSosCallTimesSettings),
  device_sos_triggered: passthrough<'device_sos_triggered'>(),
} satisfies PartialEventNormalizers;
