import type { CapabilityContext } from "@/capabilities/shared/context";
import { deepCamelKeys } from "@/shared/deep-keys";
import type { VeepooError } from "@/types/index";

// ── Types ────────────────────────────────────────────────────────────────────

/** Track metadata pushed to the Band display via `pushMusicData`. Android only. */
export interface MusicData {
  /** Optional music app identifier (vendor `musicAppId`). */
  app_id?: string;
  album?: string;
  name: string;
  artist: string;
  is_playing: boolean;
  /** Volume level 1–100 (vendor `musicVoiceLevel`). */
  volume: number;
}

/** Remote command emitted when the Band sends a music control action (`musicRemoteCommand` event). Android only. */
export type MusicRemoteCommand = "next" | "previous" | "pause_play";

// ── Native methods ──────────────────────────────────────────────────────────

export interface MusicNativeMethods {
  setMusicControlEnabled(enabled: boolean): Promise<void>;
  pushMusicData(data: MusicData): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

/** Normalizes a music remote command string from native. */
export function normalizeMusicRemoteCommand(value: unknown): MusicRemoteCommand {
  const s = typeof value === "string" ? value : "";
  if (s === "next") return "next";
  if (s === "previous") return "previous";
  if (s === "pausePlay" || s === "pause_play") return "pause_play";
  return "pause_play";
}

// ── Validators ──────────────────────────────────────────────────────────────

export function validateMusicData(data: MusicData): void {
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    throw { code: "INVALID_ARGUMENT", message: "name is required" } satisfies VeepooError;
  }
  if (typeof data.artist !== "string" || data.artist.trim().length === 0) {
    throw { code: "INVALID_ARGUMENT", message: "artist is required" } satisfies VeepooError;
  }
  if (!Number.isInteger(data.volume) || data.volume < 1 || data.volume > 100) {
    throw { code: "INVALID_ARGUMENT", message: "volume must be an integer between 1 and 100" } satisfies VeepooError;
  }
}

// ── Capability ──────────────────────────────────────────────────────────────

export class MusicCapability {
  constructor(private readonly ctx: CapabilityContext<MusicNativeMethods>) {}

  setMusicControlEnabled(enabled: boolean): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.setMusicControlEnabled(enabled),
    });
  }

  pushMusicData(data: MusicData): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateMusicData(data),
      invoke: () => this.ctx.native.pushMusicData(deepCamelKeys(data) as MusicData),
    });
  }
}
