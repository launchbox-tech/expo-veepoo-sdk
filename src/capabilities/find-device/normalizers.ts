import type { FindDevicePhase } from "../../types/index.js";
import { isRecord, toStringValue } from "../../normalizers/primitives.js";

const FIND_DEVICE_PHASES: readonly FindDevicePhase[] = [
  'unsupported',
  'searching',
  'found',
  'timeout',
  'stopped',
];

export function normalizeFindDeviceStatePayload(value: unknown): {
  deviceId: string;
  phase: FindDevicePhase;
  rawState?: number;
} {
  const record = isRecord(value) ? value : {};
  const phaseRaw = toStringValue(record.phase);
  const phase: FindDevicePhase = (FIND_DEVICE_PHASES as readonly string[]).includes(
    phaseRaw
  )
    ? (phaseRaw as FindDevicePhase)
    : 'unsupported';
  const raw = record.rawState;
  const rawState =
    typeof raw === 'number' && Number.isFinite(raw) ? Math.trunc(raw) : undefined;
  return {
    deviceId: toStringValue(record.deviceId),
    phase,
    rawState,
  };
}
