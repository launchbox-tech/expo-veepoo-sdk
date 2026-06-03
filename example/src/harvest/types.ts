// Pure data model for the Harvest (see CONTEXT.md → "Harvest (example app)" and
// docs/adr/0011-harvest-lives-in-example-app.md). No React, no SDK imports here —
// these types are shared by the engine, the hook, and the UI, and are what gets
// serialised into the exported JSON.

/** Disposition of one data point in a Harvest. Mirrors the SDK's TestState plus the example's own buckets. */
export type HarvestOutcome =
  | 'measured' // a value came back (state 'over'/'complete' or is_end)
  | 'not_worn' // Band off the wrist (state 'notWear'/'not_wear')
  | 'busy' // Band declined (state 'deviceBusy'/'device_busy') — after retries
  | 'error' // the read/test failed
  | 'timeout' // no terminal event within the per-test window
  | 'skipped'; // unsupported by this Band model, or a receive-only test that emitted nothing

export type HarvestCategory = 'realtime' | 'historical' | 'config';

/** One row in a HarvestResult: the outcome of gathering a single data point. */
export interface HarvestPoint {
  /** Stable key, e.g. 'heart_rate', 'sleep', 'battery'. */
  key: string;
  label: string;
  category: HarvestCategory;
  outcome: HarvestOutcome;
  /** The raw extracted value (full payload / read result). Serialised verbatim into the export. */
  value?: unknown;
  /** Short human-readable summary for the live UI, e.g. "72 bpm" or "3 nights". */
  detail?: string;
  /** Present when outcome is 'error'. */
  error?: string;
  startedAt: number;
  endedAt: number;
  /** Every raw SDK event payload received during this test, in arrival order. */
  events?: unknown[];
  /** Number of start attempts made (>1 means at least one device_busy retry occurred). */
  attempts?: number;
}

export interface PhaseTimingEntry {
  startedAt: number;
  endedAt: number;
  durationMs: number;
}

/** The single artifact one Harvest produces. Shown live and exported as JSON. Not persisted across runs. */
export interface HarvestResult {
  startedAt: number;
  endedAt: number;
  durationMs: number;
  deviceId: string | null;
  /** How many days of per-day history were requested. */
  historyDays: number;
  points: HarvestPoint[];
  summary: {
    total: number;
    measured: number;
    skipped: number;
    failed: number; // error + timeout + busy
    notWorn: number;
  };
  /** Wall-clock timing for each phase of the sweep. */
  phaseTimings?: Partial<Record<HarvestPhase, PhaseTimingEntry>>;
}

/** Phases the Harvest moves through, surfaced to the UI for the progress header. */
export type HarvestPhase =
  | 'idle'
  | 'preflight'
  | 'realtime'
  | 'historical'
  | 'config'
  | 'done'
  | 'cancelled'
  | 'error';

/** Live progress emitted as the sweep runs. */
export interface HarvestProgress {
  phase: HarvestPhase;
  /** 0..1 across the whole run (best-effort). */
  fraction: number;
  /** Key currently being gathered, if any. */
  currentKey: string | null;
  /** Points completed so far, in order. */
  points: HarvestPoint[];
}

/**
 * Raised by the engine when it reaches a contact-dependent test (ECG /
 * body-composition). The host resolves it once the user has a finger on the
 * electrode (proceed) or wants to skip it.
 */
export interface ContactPrompt {
  key: string;
  label: string;
  /** Resolve with true to run the test now, false to skip it. */
  resolve: (proceed: boolean) => void;
}
