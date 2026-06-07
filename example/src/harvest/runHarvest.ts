// The Harvest orchestrator: one guided sweep that gathers every data point the
// Band can produce, in dependency/priority order. App-side by design (ADR 0011).

import type { HarvestSdk } from './sdk';
import type { HarvestPhase, HarvestPoint, HarvestProgress, HarvestResult, PhaseTimingEntry } from './types';
import { RECEIVE_ONLY, SWEEP_MODALITIES } from './modalities';
import { runRealtimeTest } from './runRealtimeTest';
import { readConfig, readHistory } from './readHistory';
import { summarizePoints } from './merge';

const LOG = '[HARVEST]';
const log = (...args: unknown[]) => console.log(LOG, ...args);
const logJson = (label: string, value: unknown) => {
  try {
    console.log(LOG, label, JSON.stringify(value, null, 2));
  } catch {
    console.log(LOG, label, String(value));
  }
};

export interface RunHarvestOptions {
  historyDays: number;
  deviceId: string | null;
  signal?: AbortSignal;
  perTestTimeoutMs?: number;
  onProgress?: (progress: HarvestProgress) => void;
  /** Reached a contact-dependent test (ECG / body-comp). Resolve true to run, false to skip. */
  requestContact?: (key: string, label: string) => Promise<boolean>;
  /** Called once if the first realtime test reports the Band is off the wrist. */
  onWearWarning?: () => void;
  /** Restrict the run to these data-point keys (retry-failed flow). Undefined = full sweep. */
  only?: ReadonlySet<string>;
}

// History contributes 5 points, config 3 — used only for the progress fraction.
const HISTORY_POINTS = 5;
const CONFIG_POINTS = 3;

const now = () => Date.now();

export async function runHarvest(sdk: HarvestSdk, opts: RunHarvestOptions): Promise<HarvestResult> {
  const startedAt = now();
  const points: HarvestPoint[] = [];
  const want = (key: string) => !opts.only || opts.only.has(key);
  const total = opts.only
    ? opts.only.size
    : SWEEP_MODALITIES.length + RECEIVE_ONLY.length + HISTORY_POINTS + CONFIG_POINTS;
  let phase: HarvestPhase = 'preflight';
  const phaseTimings: Partial<Record<HarvestPhase, PhaseTimingEntry>> = {};
  let phaseStart = startedAt;

  const startPhase = (p: HarvestPhase) => {
    if (phase !== 'preflight') {
      const ended = now();
      phaseTimings[phase] = { startedAt: phaseStart, endedAt: ended, durationMs: ended - phaseStart };
    }
    phase = p;
    phaseStart = now();
    log(`\n─── phase: ${p.toUpperCase()} ───`);
  };

  log('━━━ HARVEST START ━━━');
  log(`deviceId=${opts.deviceId ?? '(none)'} historyDays=${opts.historyDays} total=${total} startedAt=${new Date(startedAt).toISOString()}`);
  if (opts.only) log(`retry-only keys: [${[...opts.only].join(', ')}]`);
  else log(`full sweep — ${SWEEP_MODALITIES.length} realtime + ${RECEIVE_ONLY.length} receive-only + history + config`);

  const emit = (currentKey: string | null) =>
    opts.onProgress?.({
      phase,
      fraction: Math.min(1, points.length / total),
      currentKey,
      points: [...points],
    });

  const aborted = () => opts.signal?.aborted === true;

  // Receive-only tests can't be triggered — listen for the whole run and keep the last payload each.
  const received = new Map<string, Record<string, unknown>>();
  const roSubs: Array<{ ro: (typeof RECEIVE_ONLY)[number]; handler: (evt: unknown) => void }> = [];
  for (const ro of RECEIVE_ONLY) {
    if (!want(ro.key)) continue;
    const handler = (evt: unknown) => {
      const payload = ((evt as Record<string, unknown>)?.[ro.field] ?? {}) as Record<string, unknown>;
      log(`[receive-only] ${ro.key} event arrived (${ro.event})`);
      logJson(`[receive-only] ${ro.key} raw payload`, payload);
      received.set(ro.key, payload);
    };
    sdk.on(ro.event, handler);
    roSubs.push({ ro, handler });
  }
  log(`listening for ${roSubs.length} receive-only test(s): ${roSubs.map(s => s.ro.key).join(', ')}`);

  const skip = (key: string, label: string, detail?: string): HarvestPoint => ({
    key,
    label,
    category: 'realtime',
    outcome: 'skipped',
    detail,
    startedAt: now(),
    endedAt: now(),
  });

  try {
    startPhase('realtime');
    log(`${SWEEP_MODALITIES.filter(m => want(m.key)).length} tests to run`);
    emit(null);

    const runRealtimeSweep = async (index: number): Promise<void> => {
      if (aborted() || index >= SWEEP_MODALITIES.length) return;
      const m = SWEEP_MODALITIES[index];
      if (!want(m.key)) {
        log(`[skip] ${m.key} — not in retry set`);
        return runRealtimeSweep(index + 1);
      }

      if (m.requiresContact) {
        log(`[contact-required] ${m.key} (${m.label}) — requesting user contact`);
        const proceed = opts.requestContact ? await opts.requestContact(m.key, m.label) : true;
        log(`[contact-required] ${m.key} user responded: ${proceed ? 'PROCEED' : 'SKIP'}`);
        if (aborted()) { log(`abort signal after contact prompt for ${m.key}`); return; }
        if (!proceed) {
          const pt = skip(m.key, m.label, 'skipped by user');
          points.push(pt);
          log(`[point] ${m.key} → skipped by user`);
          emit(null);
          return runRealtimeSweep(index + 1);
        }
      }

      log(`[start] ${m.key} (${m.label}) — event=${m.event} field=${m.field}`);
      emit(m.key);
      const point = await runRealtimeTest(sdk, m, { timeoutMs: opts.perTestTimeoutMs });
      points.push(point);
      log(`[point] ${m.key} → outcome=${point.outcome} detail="${point.detail ?? ''}" durationMs=${point.endedAt - point.startedAt}`);
      if (point.outcome === 'error') log(`[point] ${m.key} error: ${point.error}`);
      if (point.value !== undefined) logJson(`[point] ${m.key} value`, point.value);

      if (m.key === SWEEP_MODALITIES[0].key && point.outcome === 'not_worn') {
        log('⚠ WEAR WARNING — first test reports Band is off the wrist');
        opts.onWearWarning?.();
      }
      emit(null);
      return runRealtimeSweep(index + 1);
    };
    await runRealtimeSweep(0);

    if (!aborted()) {
      startPhase('historical');
      log(`${opts.historyDays} days`);
      emit('history');
      const historyPoints = await readHistory(sdk, opts.historyDays, opts.only);
      points.push(...historyPoints);
      for (const p of historyPoints) {
        log(`[point] ${p.key} → outcome=${p.outcome} detail="${p.detail ?? ''}" durationMs=${p.endedAt - p.startedAt}`);
        if (p.outcome === 'error') log(`[point] ${p.key} error: ${p.error}`);
        if (p.value !== undefined) logJson(`[point] ${p.key} value`, p.value);
      }
      emit(null);
    } else {
      log('abort signal — skipping historical phase');
    }

    if (!aborted()) {
      startPhase('config');
      emit('config');
      const configPoints = await readConfig(sdk, opts.only);
      points.push(...configPoints);
      for (const p of configPoints) {
        log(`[point] ${p.key} → outcome=${p.outcome} detail="${p.detail ?? ''}" durationMs=${p.endedAt - p.startedAt}`);
        if (p.outcome === 'error') log(`[point] ${p.key} error: ${p.error}`);
        if (p.value !== undefined) logJson(`[point] ${p.key} value`, p.value);
      }
      emit(null);
    } else {
      log('abort signal — skipping config phase');
    }
  } finally {
    roSubs.forEach(({ ro, handler }) => sdk.off(ro.event, handler));
  }

  // Fold receive-only captures (or mark skipped if nothing arrived).
  log(`\n─── folding receive-only captures ───`);
  for (const ro of RECEIVE_ONLY) {
    if (!want(ro.key)) continue;
    const got = received.get(ro.key);
    if (got) {
      log(`[receive-only] ${ro.key} → CAPTURED`);
      logJson(`[receive-only] ${ro.key} captured value`, got);
    } else {
      log(`[receive-only] ${ro.key} → no data arrived during the sweep`);
    }
    points.push(
      got
        ? { key: ro.key, label: ro.label, category: 'realtime', outcome: 'measured', value: got, detail: 'received', startedAt, endedAt: now() }
        : skip(ro.key, ro.label, 'no data emitted (receive-only)'),
    );
  }

  const finalPhase: HarvestPhase = aborted() ? 'cancelled' : 'done';
  {
    const ended = now();
    phaseTimings[phase] = { startedAt: phaseStart, endedAt: ended, durationMs: ended - phaseStart };
  }
  phase = finalPhase;
  emit(null);

  const endedAt = now();
  const result: HarvestResult = {
    startedAt,
    endedAt,
    durationMs: endedAt - startedAt,
    deviceId: opts.deviceId,
    historyDays: opts.historyDays,
    points,
    summary: summarizePoints(points),
    phaseTimings,
  };

  log('\n━━━ HARVEST COMPLETE ━━━');
  log(`phase=${phase} durationMs=${result.durationMs} endedAt=${new Date(endedAt).toISOString()}`);
  log(`summary: total=${result.summary.total} measured=${result.summary.measured} skipped=${result.summary.skipped} failed=${result.summary.failed} notWorn=${result.summary.notWorn}`);
  log('─── all points ───');
  for (const p of result.points) {
    const dur = p.endedAt - p.startedAt;
    log(`  [${p.category}] ${p.key.padEnd(25)} outcome=${p.outcome.padEnd(10)} detail="${p.detail ?? ''}" durationMs=${dur}`);
    if (p.error) log(`    error: ${p.error}`);
  }
  logJson('HARVEST RESULT (full)', result);

  return result;
}
