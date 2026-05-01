import { useState } from 'react';
import sdk from 'expo-veepoo-sdk';
import type { BloodOxygenTestResult, BloodPressureTestResult, HeartRateTestResult } from 'expo-veepoo-sdk';
import type { AppState } from './appStateReducer';
import { useSDKEvent } from './useSDKEvent';

type ActiveTest = 'hr' | 'bp' | 'spo2' | null;

export function useHealthTests(appState: AppState): {
  hrResult: HeartRateTestResult | null;
  bpResult: BloodPressureTestResult | null;
  spo2Result: BloodOxygenTestResult | null;
  activeTest: ActiveTest;
  startHR: () => Promise<void>;
  stopHR: () => Promise<void>;
  startBP: () => Promise<void>;
  stopBP: () => Promise<void>;
  startSpo2: () => Promise<void>;
  stopSpo2: () => Promise<void>;
} {
  const [hrResult, setHrResult] = useState<HeartRateTestResult | null>(null);
  const [bpResult, setBpResult] = useState<BloodPressureTestResult | null>(null);
  const [spo2Result, setSpo2Result] = useState<BloodOxygenTestResult | null>(null);
  const [activeTest, setActiveTest] = useState<ActiveTest>(null);

  const isReady = appState === 'ready';

  useSDKEvent(
    'heartRateTestResult',
    ({ result }) => {
      setHrResult(result);
      if (result.state === 'over' || result.state === 'error' || result.state === 'notWear') {
        setActiveTest(prev => (prev === 'hr' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'bloodPressureTestResult',
    ({ result }) => {
      setBpResult(result);
      if (result.state === 'over' || result.state === 'error' || result.state === 'notWear') {
        setActiveTest(prev => (prev === 'bp' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'bloodOxygenTestResult',
    ({ result }) => {
      setSpo2Result(result);
      if (result.state === 'over' || result.state === 'error' || result.state === 'notWear') {
        setActiveTest(prev => (prev === 'spo2' ? null : prev));
      }
    },
    isReady
  );

  async function startHR() {
    setHrResult(null);
    setActiveTest('hr');
    await sdk.startHeartRateTest();
  }

  async function stopHR() {
    await sdk.stopHeartRateTest();
    setActiveTest(null);
  }

  async function startBP() {
    setBpResult(null);
    setActiveTest('bp');
    await sdk.startBloodPressureTest();
  }

  async function stopBP() {
    await sdk.stopBloodPressureTest();
    setActiveTest(null);
  }

  async function startSpo2() {
    setSpo2Result(null);
    setActiveTest('spo2');
    await sdk.startBloodOxygenTest();
  }

  async function stopSpo2() {
    await sdk.stopBloodOxygenTest();
    setActiveTest(null);
  }

  return { hrResult, bpResult, spo2Result, activeTest, startHR, stopHR, startBP, stopBP, startSpo2, stopSpo2 };
}
