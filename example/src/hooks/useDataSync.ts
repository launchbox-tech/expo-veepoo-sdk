import { useCallback, useState } from 'react';
import { useVeepooSDK, useIsSessionReady } from '@gaozh1024/expo-veepoo-sdk';
import type { ReadOriginProgress, SleepData, SportStepData } from '@gaozh1024/expo-veepoo-sdk';
import { useSDKEvent } from './useSDKEvent';

export function useDataSync(): {
  dataSyncing: boolean;
  dataSyncProgress: ReadOriginProgress | null;
  sleepSummary: SleepData['summary'] | null;
  stepData: SportStepData | null;
  syncData: () => Promise<void>;
} {
  const { sdk } = useVeepooSDK();
  const isReady = useIsSessionReady();
  const [dataSyncing, setDataSyncing] = useState(false);
  const [dataSyncProgress, setDataSyncProgress] = useState<ReadOriginProgress | null>(null);
  const [sleepSummary, setSleepSummary] = useState<SleepData['summary'] | null>(null);
  const [stepData, setStepData] = useState<SportStepData | null>(null);

  useSDKEvent('readOriginProgress', ({ progress }) => setDataSyncProgress(progress), isReady);
  useSDKEvent('readOriginComplete', () => setDataSyncing(false), isReady);
  useSDKEvent('sleepData', ({ data }) => setSleepSummary(data.summary), isReady);
  useSDKEvent('sportStepData', ({ data }) => setStepData(data), isReady);

  const syncData = useCallback(async () => {
    setDataSyncing(true);
    setDataSyncProgress(null);
    setSleepSummary(null);
    setStepData(null);
    await sdk.historicalQuery.startReadOriginData();
  }, [sdk]);

  return { dataSyncing, dataSyncProgress, sleepSummary, stepData, syncData };
}
