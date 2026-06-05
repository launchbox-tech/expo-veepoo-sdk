// Sweep policy: which realtime tests the Harvest runs, in what order, and how to
// read each result. This is deliberately app-side opinion (docs/adr/0011) — the
// SDK exposes only startTest/stopTest + the result events this table wires up.

import { RealtimeTest } from 'expo-veepoo-sdk';
import type { RealtimeTestModality, VeepooEvent } from 'expo-veepoo-sdk';
import type { HarvestOutcome } from './types';

/** Where the inner payload sits on the event envelope: most tests use `result`, stress/glucose use `data`. */
type PayloadField = 'result' | 'data';

export interface SweepModality {
  key: RealtimeTestModality;
  label: string;
  event: VeepooEvent;
  field: PayloadField;
  /** Needs a finger/hand on the electrode — the Harvest nudges the user before running it. */
  requiresContact: boolean;
  /** Short summary for the live UI from the terminal payload. */
  detail: (payload: Record<string, unknown>) => string | undefined;
}

// Runtime `state` strings the native layer actually emits are broader than the
// TS union (e.g. 'notWear', 'complete'); cover both shapes.
const TERMINAL_STATES = new Set([
  'over',
  'complete',
  'error',
  'notWear',
  'not_wear',
  'deviceBusy',
  'device_busy',
]);

export function isTerminalPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  if (p.is_end === true) return true;
  return typeof p.state === 'string' && TERMINAL_STATES.has(p.state);
}

/** Classify a terminal payload. Non-terminal payloads should never reach here. */
export function outcomeFromPayload(payload: unknown): HarvestOutcome {
  const p = (payload ?? {}) as Record<string, unknown>;
  const s = typeof p.state === 'string' ? p.state : '';
  if (s === 'error') return 'error';
  if (s === 'notWear' || s === 'not_wear') return 'not_worn';
  if (s === 'deviceBusy' || s === 'device_busy') return 'busy';
  return 'measured';
}

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

/**
 * The sweep, ordered passive-wear first so the unattended portion completes
 * before any contact-dependent test (ECG / body-composition) needs the user.
 */
export const SWEEP_MODALITIES: readonly SweepModality[] = [
  {
    key: RealtimeTest.heart_rate,
    label: 'Heart rate',
    event: 'heart_rate_test_result',
    field: 'result',
    requiresContact: false,
    detail: p => (num(p.value) != null ? `${num(p.value)} bpm` : undefined),
  },
  {
    key: RealtimeTest.blood_oxygen,
    label: 'Blood oxygen (SpO₂)',
    event: 'blood_oxygen_test_result',
    field: 'result',
    requiresContact: false,
    detail: p => (num(p.value) != null ? `${num(p.value)}%` : undefined),
  },
  {
    key: RealtimeTest.temperature,
    label: 'Temperature',
    event: 'temperature_test_result',
    field: 'result',
    requiresContact: false,
    detail: p => (num(p.value) != null ? `${num(p.value)}°` : undefined),
  },
  {
    key: RealtimeTest.blood_pressure,
    label: 'Blood pressure',
    event: 'blood_pressure_test_result',
    field: 'result',
    requiresContact: false,
    detail: p =>
      num(p.systolic) != null ? `${num(p.systolic)}/${num(p.diastolic)} mmHg` : undefined,
  },
  {
    key: RealtimeTest.hrv,
    label: 'HRV',
    event: 'hrv_test_result',
    field: 'result',
    requiresContact: false,
    detail: p => (num(p.value) != null ? `${num(p.value)}` : undefined),
  },
  {
    key: RealtimeTest.stress,
    label: 'Stress',
    event: 'stress_data',
    field: 'data',
    requiresContact: false,
    detail: p => (num(p.stress) != null ? `${num(p.stress)}` : undefined),
  },
  {
    key: RealtimeTest.blood_glucose,
    label: 'Blood glucose',
    event: 'blood_glucose_data',
    field: 'data',
    requiresContact: false,
    detail: p => (num(p.glucose) != null ? `${num(p.glucose)}` : undefined),
  },
  {
    key: RealtimeTest.fatigue,
    label: 'Fatigue',
    event: 'fatigue_test_result',
    field: 'result',
    requiresContact: false,
    detail: p => (num(p.level) != null ? `level ${num(p.level)}` : undefined),
  },
  {
    key: RealtimeTest.breathing,
    label: 'Breathing rate',
    event: 'breathing_test_result',
    field: 'result',
    requiresContact: false,
    detail: p => (num(p.rate) != null ? `${num(p.rate)}/min` : undefined),
  },
  {
    key: RealtimeTest.ecg,
    label: 'ECG',
    event: 'ecg_test_result',
    field: 'result',
    requiresContact: true,
    detail: p => (num(p.heart_rate) != null ? `hr ${num(p.heart_rate)}` : undefined),
  },
  {
    key: RealtimeTest.body_composition,
    label: 'Body composition',
    event: 'body_composition_test_result',
    field: 'result',
    requiresContact: true,
    detail: p => {
      const c = p.composition as Record<string, unknown> | undefined;
      return c && num(c.bmi) != null ? `BMI ${num(c.bmi)}` : undefined;
    },
  },
];

/**
 * Receive-only tests the SDK cannot start (no `control` row). The Harvest cannot
 * trigger them; it listens passively for the whole run and records whatever
 * arrives, else marks them skipped.
 */
export const RECEIVE_ONLY: readonly { key: string; label: string; event: VeepooEvent; field: PayloadField }[] = [
  { key: 'blood_analysis', label: 'Blood analysis', event: 'blood_analysis_test_result', field: 'result' },
  { key: 'gsr', label: 'GSR / emotion', event: 'gsr_test_result', field: 'result' },
  { key: 'ptt', label: 'PTT', event: 'ptt_test_result', field: 'result' },
];
