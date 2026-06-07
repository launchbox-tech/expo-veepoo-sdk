// Public surface of the Harvest engine (example app). Pure, React-free — the
// useHarvest hook and UI build on this. See docs/adr/0011-harvest-lives-in-example-app.md.

export * from './types';
export { runHarvest, type RunHarvestOptions } from './runHarvest';
export { SWEEP_MODALITIES, RECEIVE_ONLY, type SweepModality } from './modalities';
export { runRealtimeTest, type RunRealtimeOptions } from './runRealtimeTest';
export { readHistory, readConfig } from './readHistory';
export { mergePoints, summarizePoints, failedKeys } from './merge';

import { Platform } from 'react-native';
import type { HarvestPoint, HarvestResult } from './types';

const iso = (ms: number) => new Date(ms).toISOString();
const dur = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
};

function enrichPoint(p: HarvestPoint) {
  return {
    key: p.key,
    label: p.label,
    category: p.category,
    outcome: p.outcome,
    durationMs: p.endedAt - p.startedAt,
    durationHuman: dur(p.endedAt - p.startedAt),
    startedAt: p.startedAt,
    startedAtISO: iso(p.startedAt),
    endedAt: p.endedAt,
    endedAtISO: iso(p.endedAt),
    ...(p.attempts !== undefined ? { attempts: p.attempts } : {}),
    ...(p.detail !== undefined ? { detail: p.detail } : {}),
    ...(p.error !== undefined ? { error: p.error } : {}),
    ...(p.value !== undefined ? { value: p.value } : {}),
    ...(p.events && p.events.length > 0 ? { events: p.events, eventCount: p.events.length } : {}),
  };
}

/** Verbose, annotated JSON for the export/share action. */
export function harvestToJson(result: HarvestResult): string {
  const exportedAtMs = Date.now();
  const byCategory = (['realtime', 'historical', 'config'] as const).reduce(
    (acc, cat) => {
      const pts = result.points.filter(p => p.category === cat);
      acc[cat] = {
        total: pts.length,
        measured: pts.filter(p => p.outcome === 'measured').length,
        skipped: pts.filter(p => p.outcome === 'skipped').length,
        failed: pts.filter(p => p.outcome === 'error' || p.outcome === 'timeout' || p.outcome === 'busy').length,
        notWorn: pts.filter(p => p.outcome === 'not_worn').length,
      };
      return acc;
    },
    {} as Record<string, unknown>,
  );

  const enrichedTimings = result.phaseTimings
    ? Object.fromEntries(
        Object.entries(result.phaseTimings).map(([phase, t]) => [
          phase,
          t ? { ...t, startedAtISO: iso(t.startedAt), endedAtISO: iso(t.endedAt), durationHuman: dur(t.durationMs) } : t,
        ]),
      )
    : undefined;

  const export_ = {
    _meta: {
      exportedAt: iso(exportedAtMs),
      exportedAtMs,
      platform: Platform.OS,
      platformVersion: Platform.Version,
      deviceId: result.deviceId,
      historyDays: result.historyDays,
      startedAt: result.startedAt,
      startedAtISO: iso(result.startedAt),
      endedAt: result.endedAt,
      endedAtISO: iso(result.endedAt),
      durationMs: result.durationMs,
      durationHuman: dur(result.durationMs),
    },
    summary: {
      ...result.summary,
      byCategory,
    },
    ...(enrichedTimings ? { phaseTimings: enrichedTimings } : {}),
    ...(() => {
      const points: ReturnType<typeof enrichPoint>[] = [];
      const pointsByCategory = {
        realtime: [] as ReturnType<typeof enrichPoint>[],
        historical: [] as ReturnType<typeof enrichPoint>[],
        config: [] as ReturnType<typeof enrichPoint>[],
      };
      for (const p of result.points) {
        const enriched = enrichPoint(p);
        points.push(enriched);
        if (p.category === 'realtime') pointsByCategory.realtime.push(enriched);
        else if (p.category === 'historical') pointsByCategory.historical.push(enriched);
        else if (p.category === 'config') pointsByCategory.config.push(enriched);
      }
      return { points, pointsByCategory };
    })(),
  };

  return JSON.stringify(export_, null, 2);
}
