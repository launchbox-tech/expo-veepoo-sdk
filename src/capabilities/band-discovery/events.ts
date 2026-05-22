import { passthrough, type PartialEventNormalizers } from '@/bridge/event-envelope';

export const EVENT_NORMALIZERS = {
  device_found: passthrough<'device_found'>(),
} satisfies PartialEventNormalizers;
