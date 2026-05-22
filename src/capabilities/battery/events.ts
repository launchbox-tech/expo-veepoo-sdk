import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeBatteryInfo } from './normalizers';

export const EVENT_NORMALIZERS = {
  battery_data: wrapInner('data', normalizeBatteryInfo),
} satisfies PartialEventNormalizers;
