import { useCallback, useState } from 'react';
import sdk from 'expo-veepoo-sdk';
import type {
  BloodOxygenTestResult,
  BloodPressureTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  HeartRateTestResult,
  HrvTestResult,
} from 'expo-veepoo-sdk';
import type { AppState } from './appStateReducer';
import { useSDKEvent } from './useSDKEvent';

/** One active realtime test across HR / SpO₂ / BP / vitals (native mutex matches). */
export type ActiveRealtimeTest =
  | 'hr'
  | 'bp'
  | 'spo2'
  | 'hrv'
  | 'ecg'
  | 'fatigue'
  | 'breathing'
  | null;

const LOG_CAP = 48;

function isTerminalState(state: string | undefined): boolean {
  if (!state) return false;
  return state === 'over' || state === 'error' || state === 'notWear';
}

function formatErr(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const x = e as { code?: string; message?: string };
    return `${x.code ?? 'UNKNOWN'}: ${x.message ?? ''}`;
  }
  return e instanceof Error ? e.message : String(e);
}

function clipJson(payload: unknown, max = 320): string {
  try {
    const s = JSON.stringify(payload);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return String(payload);
  }
}

export function useHealthTests(appState: AppState): {
  hrResult: HeartRateTestResult | null;
  bpResult: BloodPressureTestResult | null;
  spo2Result: BloodOxygenTestResult | null;
  hrvResult: HrvTestResult | null;
  ecgResult: EcgTestResult | null;
  fatigueResult: FatigueTestResult | null;
  breathingResult: BreathingTestResult | null;
  activeTest: ActiveRealtimeTest;
  ecgIncludeWaveform: boolean;
  setEcgIncludeWaveform: (v: boolean) => void;
  labLog: string[];
  clearLabLog: () => void;
  startHR: () => Promise<void>;
  stopHR: () => Promise<void>;
  startBP: () => Promise<void>;
  stopBP: () => Promise<void>;
  startSpo2: () => Promise<void>;
  stopSpo2: () => Promise<void>;
  startHrv: () => Promise<void>;
  stopHrv: () => Promise<void>;
  startEcg: () => Promise<void>;
  stopEcg: () => Promise<void>;
  startFatigue: () => Promise<void>;
  stopFatigue: () => Promise<void>;
  startBreathing: () => Promise<void>;
  stopBreathing: () => Promise<void>;
} {
  const [hrResult, setHrResult] = useState<HeartRateTestResult | null>(null);
  const [bpResult, setBpResult] = useState<BloodPressureTestResult | null>(null);
  const [spo2Result, setSpo2Result] = useState<BloodOxygenTestResult | null>(null);
  const [hrvResult, setHrvResult] = useState<HrvTestResult | null>(null);
  const [ecgResult, setEcgResult] = useState<EcgTestResult | null>(null);
  const [fatigueResult, setFatigueResult] = useState<FatigueTestResult | null>(null);
  const [breathingResult, setBreathingResult] = useState<BreathingTestResult | null>(null);
  const [activeTest, setActiveTest] = useState<ActiveRealtimeTest>(null);
  const [ecgIncludeWaveform, setEcgIncludeWaveform] = useState(false);
  const [labLog, setLabLog] = useState<string[]>([]);

  const isReady = appState === 'ready';

  const appendLog = useCallback((line: string) => {
    const ts = new Date().toISOString().slice(11, 23);
    setLabLog(prev => [...prev.slice(-(LOG_CAP - 1)), `[${ts}] ${line}`]);
  }, []);

  const clearLabLog = useCallback(() => setLabLog([]), []);

  useSDKEvent(
    'heartRateTestResult',
    ({ result }) => {
      setHrResult(result);
      appendLog(`heartRateTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'hr' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'bloodPressureTestResult',
    ({ result }) => {
      setBpResult(result);
      appendLog(`bloodPressureTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'bp' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'bloodOxygenTestResult',
    ({ result }) => {
      setSpo2Result(result);
      appendLog(`bloodOxygenTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'spo2' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'hrvTestResult',
    ({ result }) => {
      setHrvResult(result);
      appendLog(`hrvTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'hrv' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'ecgTestResult',
    ({ result }) => {
      const slim =
        result.waveform && result.waveform.length > 0
          ? { ...result, waveform: [`…${result.waveform.length} samples`] }
          : result;
      setEcgResult(result);
      appendLog(`ecgTestResult ${clipJson(slim)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'ecg' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'fatigueTestResult',
    ({ result }) => {
      setFatigueResult(result);
      appendLog(`fatigueTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'fatigue' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'breathingTestResult',
    ({ result }) => {
      setBreathingResult(result);
      appendLog(`breathingTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'breathing' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'error',
    err => {
      appendLog(`error ${clipJson(err)}`);
    },
    isReady
  );

  async function startHR() {
    setHrResult(null);
    try {
      setActiveTest('hr');
      await sdk.startHeartRateTest();
      appendLog('startHeartRateTest ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startHeartRateTest ${formatErr(e)}`);
    }
  }

  async function stopHR() {
    try {
      await sdk.stopHeartRateTest();
      appendLog('stopHeartRateTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startBP() {
    setBpResult(null);
    try {
      setActiveTest('bp');
      await sdk.startBloodPressureTest();
      appendLog('startBloodPressureTest ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startBloodPressureTest ${formatErr(e)}`);
    }
  }

  async function stopBP() {
    try {
      await sdk.stopBloodPressureTest();
      appendLog('stopBloodPressureTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startSpo2() {
    setSpo2Result(null);
    try {
      setActiveTest('spo2');
      await sdk.startBloodOxygenTest();
      appendLog('startBloodOxygenTest ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startBloodOxygenTest ${formatErr(e)}`);
    }
  }

  async function stopSpo2() {
    try {
      await sdk.stopBloodOxygenTest();
      appendLog('stopBloodOxygenTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startHrv() {
    setHrvResult(null);
    try {
      setActiveTest('hrv');
      await sdk.startHrvTest();
      appendLog('startHrvTest ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startHrvTest ${formatErr(e)}`);
    }
  }

  async function stopHrv() {
    try {
      await sdk.stopHrvTest();
      appendLog('stopHrvTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startEcg() {
    setEcgResult(null);
    try {
      setActiveTest('ecg');
      await sdk.startEcgTest(ecgIncludeWaveform ? { includeWaveform: true } : undefined);
      appendLog(`startEcgTest ok (includeWaveform=${ecgIncludeWaveform})`);
    } catch (e) {
      setActiveTest(null);
      appendLog(`startEcgTest ${formatErr(e)}`);
    }
  }

  async function stopEcg() {
    try {
      await sdk.stopEcgTest();
      appendLog('stopEcgTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startFatigue() {
    setFatigueResult(null);
    try {
      setActiveTest('fatigue');
      await sdk.startFatigueTest();
      appendLog('startFatigueTest ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startFatigueTest ${formatErr(e)}`);
    }
  }

  async function stopFatigue() {
    try {
      await sdk.stopFatigueTest();
      appendLog('stopFatigueTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startBreathing() {
    setBreathingResult(null);
    try {
      setActiveTest('breathing');
      await sdk.startBreathingTest();
      appendLog('startBreathingTest ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startBreathingTest ${formatErr(e)}`);
    }
  }

  async function stopBreathing() {
    try {
      await sdk.stopBreathingTest();
      appendLog('stopBreathingTest ok');
    } finally {
      setActiveTest(null);
    }
  }

  return {
    hrResult,
    bpResult,
    spo2Result,
    hrvResult,
    ecgResult,
    fatigueResult,
    breathingResult,
    activeTest,
    ecgIncludeWaveform,
    setEcgIncludeWaveform,
    labLog,
    clearLabLog,
    startHR,
    stopHR,
    startBP,
    stopBP,
    startSpo2,
    stopSpo2,
    startHrv,
    stopHrv,
    startEcg,
    stopEcg,
    startFatigue,
    stopFatigue,
    startBreathing,
    stopBreathing,
  };
}
