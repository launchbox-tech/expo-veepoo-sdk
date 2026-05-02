import { useState } from 'react';
import sdk from '@gaozh1024/expo-veepoo-sdk';
import type { ReadOriginProgress, SleepData, SportStepData } from '@gaozh1024/expo-veepoo-sdk';
import type { AppState } from './appStateReducer';
import { useSDKEvent } from './useSDKEvent';

export function useDataSync(appState: AppState): {
  dataSyncing: boolean;
  dataSyncProgress: ReadOriginProgress | null;
  sleepSummary: SleepData['summary'] | null;
  stepData: SportStepData | null;
  syncData: () => Promise<void>;
} {
  const [dataSyncing, setDataSyncing] = useState(false);
  const [dataSyncProgress, setDataSyncProgress] = useState<ReadOriginProgress | null>(null);
  const [sleepSummary, setSleepSummary] = useState<SleepData['summary'] | null>(null);
  const [stepData, setStepData] = useState<SportStepData | null>(null);

  const isReady = appState === 'ready';

  useSDKEvent('readOriginProgress', ({ progress }) => setDataSyncProgress(progress), isReady);
  useSDKEvent('readOriginComplete', () => setDataSyncing(false), isReady);
  useSDKEvent('sleepData', ({ data }) => setSleepSummary(data.summary), isReady);
  useSDKEvent('sportStepData', ({ data }) => setStepData(data), isReady);

  async function syncData() {
    setDataSyncing(true);
    setDataSyncProgress(null);
    setSleepSummary(null);
    setStepData(null);
    await sdk.startReadOriginData();
  }

  return { dataSyncing, dataSyncProgress, sleepSummary, stepData, syncData };
}
