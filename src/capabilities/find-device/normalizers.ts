import type { FindDevicePhase } from "@/types/index";
import { isRecord, toStringValue } from "@/normalizers/primitives";

const FIND_DEVICE_PHASES: readonly FindDevicePhase[] = [
  'unsupported',
  'searching',
  'found',
  'timeout',
  'stopped',
];

export function normalizeFindDeviceStatePayload(value: unknown): {
  device_id: string;
  phase: FindDevicePhase;
  raw_state?: number;
} {
  const record = isRecord(value) ? value : {};
  const phaseRaw = toStringValue(record.phase);
  const phase: FindDevicePhase = (FIND_DEVICE_PHASES as readonly string[]).includes(
    phaseRaw
  )
    ? (phaseRaw as FindDevicePhase)
    : 'unsupported';
  const raw = record.rawState ?? record.raw_state;
  const raw_state =
    typeof raw === 'number' && Number.isFinite(raw) ? Math.trunc(raw) : undefined;
  return {
    device_id: toStringValue(record.deviceId ?? record.device_id),
    phase,
    raw_state,
  };
}
