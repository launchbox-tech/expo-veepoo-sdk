// Historical + config reads for the Harvest. Per-day reads (sleep, steps, daily
// summary, origin) are aggregated across the configured range into one point
// each; the bulk 5-min origin sync is awaited via its progress/complete events.

import type { HarvestSdk } from './sdk';
import type { HarvestPoint, HarvestOutcome } from './types';

const HLOG = '[HARVEST:history]';
const hLog = (...args: unknown[]) => console.log(HLOG, ...args);
const hLogJson = (label: string, value: unknown) => {
  try {
    console.log(HLOG, label, JSON.stringify(value, null, 2));
  } catch {
    console.log(HLOG, label, String(value));
  }
};

const ORIGIN_SYNC_TIMEOUT_MS = 60_000;

function formatErr(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const x = e as { code?: string; message?: string };
    return `${x.code ?? 'UNKNOWN'}: ${x.message ?? ''}`;
  }
  return e instanceof Error ? e.message : String(e);
}

/** Local 'YYYY-MM-DD' for `offset` days ago (0 = today). */
function dateForOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const hasRows = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : v != null && typeof v === 'object';

/** Loop a per-day reader across `days` and fold into one historical HarvestPoint. */
async function readPerDay(
  key: string,
  label: string,
  days: number,
  read: (offset: number, date: string) => Promise<unknown>,
): Promise<HarvestPoint> {
  const startedAt = Date.now();
  const value: Array<{ date: string; data?: unknown; error?: string }> = [];
  let anyData = false;
  let anyErr = false;

  hLog(`readPerDay START: ${key} (${label}) for ${days} day(s)`);

  const dayResults = await Promise.all(
    Array.from({ length: days }, (_, offset) => {
      const date = dateForOffset(offset);
      return read(offset, date)
        .then(data => {
          const hasData = hasRows(data);
          hLog(`  ${key} ${date} → ${hasData ? 'has data' : 'empty'}`);
          if (hasData) hLogJson(`  ${key} ${date} data`, data);
          return { date, data, hasData, error: undefined as string | undefined };
        })
        .catch((e: unknown) => {
          const errStr = formatErr(e);
          hLog(`  ${key} ${date} → ERROR: ${errStr}`);
          return { date, data: undefined, hasData: false, error: errStr };
        });
    }),
  );

  for (const result of dayResults) {
    if (result.hasData) anyData = true;
    if (result.error) anyErr = true;
    value.push(result.error ? { date: result.date, error: result.error } : { date: result.date, data: result.data });
  }

  const outcome: HarvestOutcome = anyData ? 'measured' : anyErr ? 'error' : 'skipped';
  const daysWithData = value.filter(v => hasRows(v.data)).length;
  hLog(`readPerDay DONE: ${key} outcome=${outcome} daysWithData=${daysWithData}/${days} durationMs=${Date.now() - startedAt}`);

  return {
    key,
    label,
    category: 'historical',
    outcome,
    value,
    detail: `${daysWithData}/${days} day(s) with data`,
    startedAt,
    endedAt: Date.now(),
  };
}

/** Trigger the bulk 5-min origin sync and await its completion (counting streamed records). */
function runOriginSync(sdk: HarvestSdk): Promise<HarvestPoint> {
  const startedAt = Date.now();
  hLog(`\n── originSync START timeout=${ORIGIN_SYNC_TIMEOUT_MS}ms ──`);
  return new Promise<HarvestPoint>(resolve => {
    let progress = 0;
    let settled = false;
    const fiveMinRecords: unknown[] = [];
    const halfHourRecords: unknown[] = [];
    const progressEvents: unknown[] = [];

    const onProgress = (e: unknown) => {
      const p = (e as { progress?: number })?.progress;
      if (typeof p === 'number') {
        progress = p;
        progressEvents.push({ _elapsedMs: Date.now() - startedAt, ...((e as object) ?? {}) });
        hLog(`  originSync progress=${p} (5-min=${fiveMinRecords.length} half-hour=${halfHourRecords.length}) elapsed=${Date.now() - startedAt}ms`);
        hLogJson('  originSync progress event', e);
      }
    };
    const onFive = (e: unknown) => {
      fiveMinRecords.push(e);
      hLog(`  originSync 5-min record #${fiveMinRecords.length} elapsed=${Date.now() - startedAt}ms`);
      hLogJson(`  5-min record #${fiveMinRecords.length}`, e);
    };
    const onHalf = (e: unknown) => {
      halfHourRecords.push(e);
      hLog(`  originSync half-hour record #${halfHourRecords.length} elapsed=${Date.now() - startedAt}ms`);
      hLogJson(`  half-hour record #${halfHourRecords.length}`, e);
    };

    const finish = (outcome: HarvestOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      sdk.off('read_origin_progress', onProgress);
      sdk.off('read_origin_complete', onComplete);
      sdk.off('origin_five_minute_data', onFive);
      sdk.off('origin_half_hour_data', onHalf);
      const durationMs = Date.now() - startedAt;
      hLog(`originSync DONE: outcome=${outcome} progress=${progress} 5-min=${fiveMinRecords.length} half-hour=${halfHourRecords.length} durationMs=${durationMs}`);
      resolve({
        key: 'origin_sync',
        label: 'Origin sync (5-min)',
        category: 'historical',
        outcome,
        value: {
          progress,
          fiveMinuteCount: fiveMinRecords.length,
          halfHourCount: halfHourRecords.length,
          progressEvents,
          fiveMinuteRecords: fiveMinRecords,
          halfHourRecords,
        },
        detail: `${fiveMinRecords.length} × 5-min, ${halfHourRecords.length} × half-hour records`,
        startedAt,
        endedAt: Date.now(),
      });
    };
    const onComplete = (e: unknown) => {
      hLog(`originSync complete event received`);
      hLogJson('originSync complete event', e);
      finish('measured');
    };

    const timer = setTimeout(() => {
      hLog(`⏱ originSync TIMEOUT after ${ORIGIN_SYNC_TIMEOUT_MS}ms — 5-min=${fiveMinRecords.length} half-hour=${halfHourRecords.length}`);
      finish('timeout');
    }, ORIGIN_SYNC_TIMEOUT_MS);

    sdk.on('read_origin_progress', onProgress);
    sdk.on('read_origin_complete', onComplete);
    sdk.on('origin_five_minute_data', onFive);
    sdk.on('origin_half_hour_data', onHalf);
    hLog('starting startReadOriginData()');
    sdk.historicalQuery.startReadOriginData().catch(e => {
      hLog(`startReadOriginData error: ${formatErr(e)}`);
      finish('error');
    });
  });
}

/** Read historical data points for the Harvest. `only` restricts which keys run (retry flow). */
export async function readHistory(
  sdk: HarvestSdk,
  days: number,
  only?: ReadonlySet<string>,
): Promise<HarvestPoint[]> {
  const want = (k: string) => !only || only.has(k);
  const out: HarvestPoint[] = [];

  hLog(`\n━━ readHistory: days=${days} keys=${only ? [...only].join(',') : 'all'} ━━`);

  // Origin sync first so per-day reads see freshly-synced records.
  if (want('origin_sync')) {
    hLog('starting origin sync (runs before per-day reads)');
    out.push(await runOriginSync(sdk));
  } else {
    hLog('skipping origin sync (not in retry set)');
  }

  const tasks: Array<Promise<HarvestPoint>> = [];
  if (want('sleep')) { hLog('queuing: sleep'); tasks.push(readPerDay('sleep', 'Sleep', days, (_o, date) => sdk.sleepData.readSleepData(date))); }
  if (want('steps')) { hLog('queuing: steps'); tasks.push(readPerDay('steps', 'Steps', days, (_o, date) => sdk.sportSteps.readSportStepData(date))); }
  if (want('day_summary')) { hLog('queuing: day_summary'); tasks.push(readPerDay('day_summary', 'Daily summary', days, o => sdk.daySummary.readDaySummaryData(o))); }
  if (want('origin_5min')) { hLog('queuing: origin_5min'); tasks.push(readPerDay('origin_5min', 'Origin 5-min records', days, o => sdk.originData.readOriginData(o))); }

  hLog(`running ${tasks.length} per-day read task(s) in parallel`);
  out.push(...(await Promise.all(tasks)));
  hLog(`readHistory complete: ${out.length} points`);
  return out;
}

/** Read device config/status points (battery, version, functions). `only` restricts which keys run. */
export async function readConfig(sdk: HarvestSdk, only?: ReadonlySet<string>): Promise<HarvestPoint[]> {
  const want = (k: string) => !only || only.has(k);

  hLog(`\n━━ readConfig: keys=${only ? [...only].join(',') : 'all'} ━━`);

  const one = async (
    key: string,
    label: string,
    read: () => Promise<unknown>,
    detail: (v: unknown) => string | undefined,
  ): Promise<HarvestPoint> => {
    const startedAt = Date.now();
    hLog(`  reading config: ${key} (${label})`);
    try {
      const value = await read();
      const durationMs = Date.now() - startedAt;
      hLog(`  ${key} → measured durationMs=${durationMs} detail="${detail(value) ?? ''}"`);
      hLogJson(`  ${key} raw value`, value);
      return { key, label, category: 'config', outcome: 'measured', value, detail: detail(value), startedAt, endedAt: Date.now() };
    } catch (e) {
      const errStr = formatErr(e);
      hLog(`  ${key} → ERROR: ${errStr} durationMs=${Date.now() - startedAt}`);
      return { key, label, category: 'config', outcome: 'error', error: errStr, startedAt, endedAt: Date.now() };
    }
  };

  const tasks: Array<Promise<HarvestPoint>> = [];
  if (want('battery')) {
    hLog('queuing: battery');
    tasks.push(
      one('battery', 'Battery', () => sdk.battery.readBattery(), v => {
        const b = (v as { percent?: number; level?: number }) ?? {};
        const p = b.percent ?? b.level;
        return typeof p === 'number' ? `${p}%` : undefined;
      }),
    );
  }
  if (want('device_version')) {
    hLog('queuing: device_version');
    tasks.push(
      one('device_version', 'Firmware version', () => sdk.deviceVersion.readDeviceVersion(), v => {
        const x = (v as {
          firmware_version?: string;
          software_version?: string;
          hardware_version?: string;
        }) ?? {};
        // Bands often leave firmware_version empty; fall back through the chain.
        return (
          [x.firmware_version, x.software_version, x.hardware_version].find(s => s && s.length > 0) ??
          undefined
        );
      }),
    );
  }
  if (want('device_functions')) {
    hLog('queuing: device_functions');
    tasks.push(
      one('device_functions', 'Device functions', () => sdk.deviceFunctions.readDeviceFunctions(), v => {
        const keys = v && typeof v === 'object' ? Object.keys(v as object).length : 0;
        return `${keys} flags`;
      }),
    );
  }
  const results = await Promise.all(tasks);
  hLog(`readConfig complete: ${results.length} points`);
  return results;
}
