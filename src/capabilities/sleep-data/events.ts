import { passthrough, wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeSleepDataList } from './normalizers';

export const EVENT_NORMALIZERS = {
  sleep_data: wrapInner('data', (raw) => normalizeSleepDataList(raw)[0]),
  accurate_sleep_data: passthrough<'accurate_sleep_data'>(),
} satisfies PartialEventNormalizers;
