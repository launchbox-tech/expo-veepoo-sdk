import { useState } from 'react';
import { useVeepooSDK, useSDKState } from 'expo-veepoo-sdk';
import type { ReadOriginProgress, SleepData, SportStepData } from 'expo-veepoo-sdk';
import { useSDKEvent } from './useSDKEvent';

export function useDataSync(): {
  dataSyncing: boolean;
  dataSyncProgress: ReadOriginProgress | null;
  sleepSummary: SleepData['summary'] | null;
  stepData: SportStepData | null;
  syncData: () => Promise<void>;
} {
  const { sdk } = useVeepooSDK();
  const isReady = useSDKState((s) => s.isReady);
  const [dataSyncing, setDataSyncing] = useState(false);
  const [dataSyncProgress, setDataSyncProgress] = useState<ReadOriginProgress | null>(null);
  const [sleepSummary, setSleepSummary] = useState<SleepData['summary'] | null>(null);
  const [stepData, setStepData] = useState<SportStepData | null>(null);

  useSDKEvent('read_origin_progress', ({ progress }) => setDataSyncProgress(progress), isReady);
  useSDKEvent('read_origin_complete', () => setDataSyncing(false), isReady);
  useSDKEvent('sleep_data', ({ data }) => setSleepSummary(data.summary), isReady);
  useSDKEvent('sport_step_data', ({ data }) => setStepData(data), isReady);

  async function syncData() {
    setDataSyncing(true);
    setDataSyncProgress(null);
    setSleepSummary(null);
    setStepData(null);
    await sdk.historicalQuery.startReadOriginData();
  }

  return { dataSyncing, dataSyncProgress, sleepSummary, stepData, syncData };
}
