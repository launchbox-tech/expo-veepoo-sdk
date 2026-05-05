import type { FirmwareDfuState, VeepooEventPayload } from "@/types/index";
import { isRecord, clamp, toInt, toStringValue } from "@/normalizers/primitives";

const FIRMWARE_DFU_STATES: readonly FirmwareDfuState[] = [
  'file_not_exist',
  'start',
  'updating',
  'success',
  'failure',
  'prepared',
  'reboot',
  'reconnecting',
  'dfu_lang_connect_success',
  'dfu_lang_connect_failed',
  'unknown',
];

const FIRMWARE_DFU_STATE_VALUE_MAP: Record<string, FirmwareDfuState> = {
  fileNotExist: 'file_not_exist',
  dfuLangConnectSuccess: 'dfu_lang_connect_success',
  dfuLangConnectFailed: 'dfu_lang_connect_failed',
};

export function normalizeFirmwareDfuProgress(value: unknown): VeepooEventPayload['firmwareDfuProgress'] {
  const p = isRecord(value) ? value : {};
  const stateRaw = toStringValue(p.state, 'unknown');
  const stateMapped = FIRMWARE_DFU_STATE_VALUE_MAP[stateRaw] ?? stateRaw;
  const state: FirmwareDfuState = (FIRMWARE_DFU_STATES as readonly string[]).includes(
    stateMapped
  )
    ? (stateMapped as FirmwareDfuState)
    : 'unknown';
  let message: string | undefined;
  if (p.message !== undefined && p.message !== null) {
    message = String(p.message);
  }
  const out: VeepooEventPayload['firmwareDfuProgress'] = {
    device_id: toStringValue(p.deviceId ?? p.device_id) ?? '',
    progress: clamp(toInt(p.progress) ?? 0, 0, 100),
    state,
  };
  if (message !== undefined) {
    out.message = message;
  }
  return out;
}
