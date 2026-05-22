import type { VeepooEventPayload } from '@/types/index';
import { isRecord } from '@/normalizers/primitives';
import { type PartialEventNormalizers } from '@/bridge/event-envelope';

export const EVENT_NORMALIZERS = {
  sport_mode_data: (raw) => {
    const p = isRecord(raw) ? raw : {};
    const rawMode = p.mode;
    // Native sends camelCase e.g. "outdoorRun"; TypeScript SportMode is snake_case "outdoor_run"
    const mode =
      typeof rawMode === 'string' && rawMode !== '' && rawMode !== 'common'
        ? (rawMode.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) as VeepooEventPayload['sport_mode_data']['mode'])
        : null;
    return { ...p, mode } as VeepooEventPayload['sport_mode_data'];
  },
} satisfies PartialEventNormalizers;
