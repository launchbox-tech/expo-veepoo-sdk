// Helpers for the "Retry failed" flow: a retry runs a Harvest restricted to the
// failed keys, then merges its points back over the previous result.

import type { HarvestOutcome, HarvestPoint, HarvestResult } from './types';

/** Outcomes worth re-running. Genuine API gaps still re-fail fast, so retrying them is cheap. */
const RETRYABLE_OUTCOMES: ReadonlySet<HarvestOutcome> = new Set<HarvestOutcome>([
  'error',
  'timeout',
  'busy',
  'not_worn',
]);

/** Replace base points by key with `updates`; keep base order, append any new keys. */
export function mergePoints(base: HarvestPoint[], updates: HarvestPoint[]): HarvestPoint[] {
  const byKey = new Map(updates.map(p => [p.key, p] as const));
  const merged = base.map(p => byKey.get(p.key) ?? p);
  for (const u of updates) {
    if (!base.some(b => b.key === u.key)) merged.push(u);
  }
  return merged;
}

export function summarizePoints(points: HarvestPoint[]): HarvestResult['summary'] {
  const count = (test: (p: HarvestPoint) => boolean) => points.filter(test).length;
  return {
    total: points.length,
    measured: count(p => p.outcome === 'measured'),
    skipped: count(p => p.outcome === 'skipped'),
    failed: count(p => p.outcome === 'error' || p.outcome === 'timeout' || p.outcome === 'busy'),
    notWorn: count(p => p.outcome === 'not_worn'),
  };
}

export const failedKeys = (points: HarvestPoint[]): string[] => {
  const keys: string[] = [];
  for (const p of points) {
    if (RETRYABLE_OUTCOMES.has(p.outcome)) keys.push(p.key);
  }
  return keys;
};
