import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, clamp, toInt, toStringValue } from "@/shared/primitives";
import type { VeepooError, VeepooEventPayload } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

// FirmwareDfuState / FirmwareDfuProgress live in `types/events.ts` because
// `firmware_dfu_progress` has a non-standard envelope (no nested `data` field).
// The normalizer in this module produces the payload shape declared there.

// ── Native methods ──────────────────────────────────────────────────────────

export interface DfuNativeMethods {
  startLocalFirmwareDfu(filePath: string): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

const FIRMWARE_DFU_STATES = [
  "file_not_exist",
  "start",
  "updating",
  "success",
  "failure",
  "prepared",
  "reboot",
  "reconnecting",
  "dfu_lang_connect_success",
  "dfu_lang_connect_failed",
  "unknown",
] as const;

type FirmwareDfuState = (typeof FIRMWARE_DFU_STATES)[number];

const FIRMWARE_DFU_STATE_VALUE_MAP: Record<string, FirmwareDfuState> = {
  fileNotExist: "file_not_exist",
  dfuLangConnectSuccess: "dfu_lang_connect_success",
  dfuLangConnectFailed: "dfu_lang_connect_failed",
};

export function normalizeFirmwareDfuProgress(value: unknown): VeepooEventPayload["firmware_dfu_progress"] {
  const p = isRecord(value) ? value : {};
  const stateRaw = toStringValue(p.state, "unknown");
  const stateMapped = FIRMWARE_DFU_STATE_VALUE_MAP[stateRaw] ?? stateRaw;
  const state: FirmwareDfuState = (FIRMWARE_DFU_STATES as readonly string[]).includes(
    stateMapped,
  )
    ? (stateMapped as FirmwareDfuState)
    : "unknown";
  let message: string | undefined;
  if (p.message !== undefined && p.message !== null) {
    message = String(p.message);
  }
  const out: VeepooEventPayload["firmware_dfu_progress"] = {
    device_id: toStringValue(p.deviceId ?? p.device_id) ?? "",
    progress: clamp(toInt(p.progress) ?? 0, 0, 100),
    state,
  };
  if (message !== undefined) {
    out.message = message;
  }
  return out;
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateFirmwareDfuFilePath(filePath: string): void {
  if (typeof filePath !== "string" || filePath.trim().length === 0) {
    throw { code: "INVALID_ARGUMENT", message: "filePath is required" } satisfies VeepooError;
  }
  if (filePath.length > 4096) {
    throw { code: "INVALID_ARGUMENT", message: "filePath is too long" } satisfies VeepooError;
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class DfuCapability {
  constructor(private readonly ctx: CapabilityContext<DfuNativeMethods>) {}

  /**
   * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
   * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
   */
  startLocalFirmwareDfu(filePath: string): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateFirmwareDfuFilePath(filePath),
      invoke: () => this.ctx.native.startLocalFirmwareDfu(filePath.trim()),
    });
  }
}
