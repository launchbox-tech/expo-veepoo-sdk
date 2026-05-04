import type { FirmwareDfuState, VeepooEventPayload } from "../../types/index.js";
import { isRecord, clamp, toInt, toStringValue } from "../../normalizers/primitives.js";

const FIRMWARE_DFU_STATES: readonly FirmwareDfuState[] = [
  'fileNotExist',
  'start',
  'updating',
  'success',
  'failure',
  'prepared',
  'reboot',
  'reconnecting',
  'dfuLangConnectSuccess',
  'dfuLangConnectFailed',
  'unknown',
];

export function normalizeFirmwareDfuProgress(value: unknown): VeepooEventPayload['firmwareDfuProgress'] {
  const p = isRecord(value) ? value : {};
  const stateRaw = toStringValue(p.state, 'unknown');
  const state: FirmwareDfuState = (FIRMWARE_DFU_STATES as readonly string[]).includes(
    stateRaw
  )
    ? (stateRaw as FirmwareDfuState)
    : 'unknown';
  let message: string | undefined;
  if (p.message !== undefined && p.message !== null) {
    message = String(p.message);
  }
  const out: VeepooEventPayload['firmwareDfuProgress'] = {
    deviceId: toStringValue(p.deviceId) ?? '',
    progress: clamp(toInt(p.progress) ?? 0, 0, 100),
    state,
  };
  if (message !== undefined) {
    out.message = message;
  }
  return out;
}
