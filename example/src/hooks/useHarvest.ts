import { useCallback, useRef, useState } from 'react';
import { Share } from 'react-native';
import { useVeepooSDK, useSDKState } from '@gaozh1024/expo-veepoo-sdk';
import { runHarvest, harvestToJson, failedKeys, mergePoints, summarizePoints } from '../harvest';
import type { HarvestProgress, HarvestResult } from '../harvest';

export interface ContactRequest {
  key: string;
  label: string;
}

/**
 * React surface over the Harvest engine (../harvest). Owns the AbortController,
 * the pending contact-prompt promise, and the export action. The orchestration
 * itself stays in the engine (ADR 0011).
 */
export function useHarvest(): {
  running: boolean;
  progress: HarvestProgress | null;
  result: HarvestResult | null;
  contact: ContactRequest | null;
  wearWarning: boolean;
  historyDays: number;
  setHistoryDays: (n: number) => void;
  canStart: boolean;
  failedCount: number;
  start: () => Promise<void>;
  retryFailed: () => Promise<void>;
  cancel: () => void;
  resolveContact: (proceed: boolean) => void;
  exportJson: () => Promise<void>;
} {
  const { sdk } = useVeepooSDK();
  const deviceId = useSDKState(s => s.connectedDeviceId);
  const isReady = useSDKState(s => s.isReady);

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<HarvestProgress | null>(null);
  const [result, setResult] = useState<HarvestResult | null>(null);
  const [contact, setContact] = useState<ContactRequest | null>(null);
  const [wearWarning, setWearWarning] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);

  const abortRef = useRef<AbortController | null>(null);
  const contactResolver = useRef<((proceed: boolean) => void) | null>(null);

  const resolveContact = useCallback((proceed: boolean) => {
    setContact(null);
    contactResolver.current?.(proceed);
    contactResolver.current = null;
  }, []);

  // Shared run flow. `only` set => retry just those keys, merged over the prior result.
  const runFlow = useCallback(
    async (only?: ReadonlySet<string>) => {
      if (!isReady || running) return;
      const base = only ? result?.points ?? [] : [];
      const priorStartedAt = result?.startedAt;
      const controller = new AbortController();
      abortRef.current = controller;
      setRunning(true);
      if (!only) {
        setResult(null);
        setProgress(null);
      }
      setWearWarning(false);
      try {
        const res = await runHarvest(sdk, {
          historyDays,
          deviceId,
          only,
          signal: controller.signal,
          onProgress: p => setProgress(only ? { ...p, points: mergePoints(base, p.points) } : p),
          onWearWarning: () => setWearWarning(true),
          requestContact: (key, label) =>
            new Promise<boolean>(resolve => {
              contactResolver.current = resolve;
              setContact({ key, label });
            }),
        });
        if (only) {
          const merged = mergePoints(base, res.points);
          const startedAt = priorStartedAt ?? res.startedAt;
          setResult({
            ...res,
            startedAt,
            durationMs: res.endedAt - startedAt,
            points: merged,
            summary: summarizePoints(merged),
          });
        } else {
          setResult(res);
        }
      } finally {
        setRunning(false);
        abortRef.current = null;
        setContact(null);
        contactResolver.current = null;
      }
    },
    [sdk, isReady, running, historyDays, deviceId, result],
  );

  const start = useCallback(() => runFlow(undefined), [runFlow]);

  const retryFailed = useCallback(() => {
    const keys = result ? failedKeys(result.points) : [];
    if (keys.length === 0) return Promise.resolve();
    return runFlow(new Set(keys));
  }, [result, runFlow]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    // Unblock the engine if it's parked on a contact prompt.
    contactResolver.current?.(false);
    contactResolver.current = null;
    setContact(null);
  }, []);

  const exportJson = useCallback(async () => {
    if (!result) return;
    await Share.share({ message: harvestToJson(result) });
  }, [result]);

  return {
    running,
    progress,
    result,
    contact,
    wearWarning,
    historyDays,
    setHistoryDays,
    canStart: isReady && !running,
    failedCount: result ? failedKeys(result.points).length : 0,
    start,
    retryFailed,
    cancel,
    resolveContact,
    exportJson,
  };
}
