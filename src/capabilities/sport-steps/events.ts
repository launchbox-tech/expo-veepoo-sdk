import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeSportStepData } from './normalizers';

export const EVENT_NORMALIZERS = {
  sport_step_data: wrapInner('data', normalizeSportStepData),
} satisfies PartialEventNormalizers;
