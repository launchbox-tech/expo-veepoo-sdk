// Promisifies one realtime test: subscribe to its result event, start it, await a
// terminal payload (or time out), stop it, and reduce the run to a HarvestPoint.
// This is the per-test primitive the sweep loops over. Kept app-side per ADR 0011.

import { RealtimeTest } from 'expo-veepoo-sdk';
import type { HarvestSdk } from './sdk';
import type { HarvestPoint, HarvestOutcome } from './types';
import { isTerminalPayload, outcomeFromPayload, type SweepModality } from './modalities';

const RTLOG = '[HARVEST:realtime]';
const rtLog = (...args: unknown[]) => console.log(RTLOG, ...args);
const rtLogJson = (label: string, value: unknown) => {
  try {
    console.log(RTLOG, label, JSON.stringify(value, null, 2));
  } catch {
    console.log(RTLOG, label, String(value));
  }
};

export interface RunRealtimeOptions {
  timeoutMs?: number;
  busyRetries?: number;
  busyBackoffMs?: number;
  /** Each interim/terminal payload, for live UI. */
  onUpdate?: (payload: Record<string, unknown>) => void;
}

const DEFAULT_TIMEOUT_MS = 180_000; // 3 min — supported live tests (SpO2/temp/body-comp) can take minutes to settle
const DEFAULT_BUSY_RETRIES = 1;
const DEFAULT_BUSY_BACKOFF_MS = 1500;

type AttemptReason = 'terminal' | 'timeout' | 'start-error';

interface AttemptResult {
  payload: Record<string, unknown>;
  reason: AttemptReason;
  error?: string;
  /** All event payloads received during this attempt, in order. */
  allPayloads: unknown[];
}

function formatErr(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const x = e as { code?: string; message?: string; nativeCode?: string };
    const nc = x.nativeCode ? ` nativeCode=${x.nativeCode}` : '';
    return `${x.code ?? 'UNKNOWN'}: ${x.message ?? ''}${nc}`;
  }
  return e instanceof Error ? e.message : String(e);
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function startTest(sdk: HarvestSdk, m: SweepModality): Promise<void> {
  return m.key === RealtimeTest.ecg
    ? sdk.realtimeTests.startEcgTest()
    : sdk.realtimeTests.startTest(m.key);
}

function stopTest(sdk: HarvestSdk, m: SweepModality): Promise<void> {
  return m.key === RealtimeTest.ecg
    ? sdk.realtimeTests.stopEcgTest()
    : sdk.realtimeTests.stopTest(m.key);
}

function attempt(
  sdk: HarvestSdk,
  m: SweepModality,
  timeoutMs: number,
  onUpdate?: (p: Record<string, unknown>) => void,
  attemptIndex = 0,
): Promise<AttemptResult> {
  return new Promise<AttemptResult>(resolve => {
    let last: Record<string, unknown> | undefined;
    let settled = false;
    let eventCount = 0;
    const allPayloads: unknown[] = [];
    const attemptStart = Date.now();
    rtLog(`attempt #${attemptIndex + 1} for ${m.key} — timeout=${timeoutMs}ms event=${m.event}`);

    const handler = (evt: unknown) => {
      const env = (evt ?? {}) as Record<string, unknown>;
      const payload = (env[m.field] ?? {}) as Record<string, unknown>;
      eventCount++;
      const isTerminal = isTerminalPayload(payload);
      allPayloads.push({ _seq: eventCount, _elapsedMs: Date.now() - attemptStart, _isTerminal: isTerminal, ...payload });
      rtLog(`event #${eventCount} for ${m.key} isTerminal=${isTerminal} elapsed=${Date.now() - attemptStart}ms`);
      rtLogJson(`  ${m.key} event #${eventCount} payload`, payload);
      last = payload;
      onUpdate?.(payload);
      if (isTerminal) finish({ payload, reason: 'terminal', allPayloads });
    };

    const finish = (r: AttemptResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      sdk.off(m.event, handler);
      const elapsed = Date.now() - attemptStart;
      rtLog(`attempt #${attemptIndex + 1} for ${m.key} finished: reason=${r.reason} events=${eventCount} elapsed=${elapsed}ms`);
      if (r.error) rtLog(`  start-error: ${r.error}`);
      rtLogJson(`  ${m.key} final payload`, r.payload);
      void stopTest(sdk, m).catch(e => rtLog(`  stopTest error for ${m.key}: ${formatErr(e)}`));
      resolve(r);
    };

    const timer = setTimeout(() => {
      rtLog(`⏱ TIMEOUT for ${m.key} after ${timeoutMs}ms — ${eventCount} event(s) received`);
      finish({ payload: last ?? {}, reason: 'timeout', allPayloads });
    }, timeoutMs);

    sdk.on(m.event, handler);
    rtLog(`starting test ${m.key}`);
    startTest(sdk, m).catch(e => {
      rtLog(`startTest error for ${m.key}: ${formatErr(e)}`);
      finish({ payload: { state: 'error' }, reason: 'start-error', error: formatErr(e), allPayloads });
    });
  });
}

/** Run one realtime test to completion and return its HarvestPoint. Retries once on `device_busy`. */
export async function runRealtimeTest(
  sdk: HarvestSdk,
  m: SweepModality,
  opts: RunRealtimeOptions = {},
): Promise<HarvestPoint> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const busyRetries = opts.busyRetries ?? DEFAULT_BUSY_RETRIES;
  const busyBackoffMs = opts.busyBackoffMs ?? DEFAULT_BUSY_BACKOFF_MS;
  const startedAt = Date.now();

  rtLog(`\n── runRealtimeTest: ${m.key} (${m.label}) ──`);
  rtLog(`timeoutMs=${timeoutMs} busyRetries=${busyRetries} busyBackoffMs=${busyBackoffMs}`);

  const allEvents: unknown[] = [];
  let totalAttempts = 1;

  let result = await attempt(sdk, m, timeoutMs, opts.onUpdate, 0);
  allEvents.push(...result.allPayloads);
  let outcome = reduce(result);
  rtLog(`initial outcome for ${m.key}: ${outcome}`);

  for (let i = 0; i < busyRetries && outcome === 'busy'; i++) {
    totalAttempts++;
    rtLog(`device_busy for ${m.key} — waiting ${busyBackoffMs}ms then retry ${i + 1}/${busyRetries}`);
    await delay(busyBackoffMs);
    result = await attempt(sdk, m, timeoutMs, opts.onUpdate, i + 1);
    allEvents.push(...result.allPayloads);
    outcome = reduce(result);
    rtLog(`retry ${i + 1} outcome for ${m.key}: ${outcome}`);
  }

  const measured = outcome === 'measured';
  const point: HarvestPoint = {
    key: m.key,
    label: m.label,
    category: 'realtime',
    outcome,
    value: measured ? result.payload : undefined,
    detail: measured ? m.detail(result.payload) : undefined,
    error: result.error,
    startedAt,
    endedAt: Date.now(),
    events: allEvents,
    attempts: totalAttempts,
  };

  rtLog(`DONE ${m.key}: outcome=${outcome} attempts=${totalAttempts} totalEvents=${allEvents.length} durationMs=${point.endedAt - startedAt} detail="${point.detail ?? ''}"`);
  if (!measured) rtLog(`  non-measured reason: ${result.reason}${result.error ? ` — ${result.error}` : ''}`);

  return point;
}

function reduce(r: AttemptResult): HarvestOutcome {
  if (r.reason === 'timeout') return 'timeout';
  if (r.reason === 'start-error') return 'error';
  return outcomeFromPayload(r.payload);
}
