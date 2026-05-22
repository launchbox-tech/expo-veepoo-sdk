import type { VeepooEventPayload } from '@/types/index';
import { isRecord } from '@/normalizers/primitives';
import { type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeDeviceFunctions } from './normalizers/index';

export const EVENT_NORMALIZERS = {
  device_function: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      data: normalizeDeviceFunctions(p.data ?? p.functions),
      functions: normalizeDeviceFunctions(p.functions ?? p.data),
    } as VeepooEventPayload['device_function'];
  },
} satisfies PartialEventNormalizers;
