import { passthrough, wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import {
  normalizeHalfHourData,
  normalizeOriginDataList,
  normalizeReadOriginProgressPayload,
  normalizeSpo2OriginData,
} from './normalizers';

export const EVENT_NORMALIZERS = {
  origin_five_minute_data: wrapInner('data', (raw) => normalizeOriginDataList([raw])[0]),
  origin_half_hour_data: wrapInner('data', normalizeHalfHourData),
  origin_spo2_data: wrapInner('data', normalizeSpo2OriginData),
  read_origin_complete: passthrough<'read_origin_complete'>(),
  read_origin_progress: (raw) => normalizeReadOriginProgressPayload(raw),
} satisfies PartialEventNormalizers;
