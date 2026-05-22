import { passthrough, type PartialEventNormalizers } from '@/bridge/event-envelope';

export const EVENT_NORMALIZERS = {
  device_switches_data: passthrough<'device_switches_data'>(),
} satisfies PartialEventNormalizers;
