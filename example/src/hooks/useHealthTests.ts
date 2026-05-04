import { useCallback, useState } from 'react';
import sdk, { RealtimeTest } from "@gaozh1024/expo-veepoo-sdk";
import type {
  BloodOxygenTestResult,
  BloodPressureTestResult,
  BodyCompositionTestResult,
  BreathingTestResult,
  EcgTestResult,
  FatigueTestResult,
  HeartRateTestResult,
  HrvTestResult,
} from "@gaozh1024/expo-veepoo-sdk";
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
  | 'bodyComposition'
  | null;

const LOG_CAP = 48;

function isTerminalState(state: string | undefined): boolean {
  if (!state) return false;
  return (
    state === 'over' ||
    state === 'error' ||
    state === 'notWear' ||
    state === 'complete'
  );
}

function formatErr(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const x = e as { code?: string; message?: string; nativeCode?: string };
    const nc = x.nativeCode ? ` nativeCode=${x.nativeCode}` : '';
    return `${x.code ?? 'UNKNOWN'}: ${x.message ?? ''}${nc}`;
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
  bodyCompositionResult: BodyCompositionTestResult | null;
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
  startBodyComposition: () => Promise<void>;
  stopBodyComposition: () => Promise<void>;
} {
  const [hrResult, setHrResult] = useState<HeartRateTestResult | null>(null);
  const [bpResult, setBpResult] = useState<BloodPressureTestResult | null>(null);
  const [spo2Result, setSpo2Result] = useState<BloodOxygenTestResult | null>(null);
  const [hrvResult, setHrvResult] = useState<HrvTestResult | null>(null);
  const [ecgResult, setEcgResult] = useState<EcgTestResult | null>(null);
  const [fatigueResult, setFatigueResult] = useState<FatigueTestResult | null>(null);
  const [breathingResult, setBreathingResult] = useState<BreathingTestResult | null>(null);
  const [bodyCompositionResult, setBodyCompositionResult] =
    useState<BodyCompositionTestResult | null>(null);
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
    ({ deviceId: _, result }) => {
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
    ({ deviceId: _, result }) => {
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
    ({ deviceId: _, result }) => {
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
    ({ deviceId: _, result }) => {
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
    ({ deviceId: _, result }) => {
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
    ({ deviceId: _, result }) => {
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
    ({ deviceId: _, result }) => {
      setBreathingResult(result);
      appendLog(`breathingTestResult ${clipJson(result)}`);
      if (isTerminalState(result.state)) {
        setActiveTest(prev => (prev === 'breathing' ? null : prev));
      }
    },
    isReady
  );

  useSDKEvent(
    'bodyCompositionTestResult',
    ({ deviceId: _, result }) => {
      setBodyCompositionResult(result);
      appendLog(`bodyCompositionTestResult ${clipJson(result)}`);
      if (result.isEnd === true || isTerminalState(String(result.state))) {
        setActiveTest(prev => (prev === 'bodyComposition' ? null : prev));
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
      await sdk.startTest(RealtimeTest.HEART_RATE);
      appendLog('startTest(heartRate) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(heartRate) ${formatErr(e)}`);
    }
  }

  async function stopHR() {
    try {
      await sdk.stopTest(RealtimeTest.HEART_RATE);
      appendLog('stopTest(heartRate) ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startBP() {
    setBpResult(null);
    try {
      setActiveTest('bp');
      await sdk.startTest(RealtimeTest.BLOOD_PRESSURE);
      appendLog('startTest(bloodPressure) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(bloodPressure) ${formatErr(e)}`);
    }
  }

  async function stopBP() {
    try {
      await sdk.stopTest(RealtimeTest.BLOOD_PRESSURE);
      appendLog('stopTest(bloodPressure) ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startSpo2() {
    setSpo2Result(null);
    try {
      setActiveTest('spo2');
      await sdk.startTest(RealtimeTest.BLOOD_OXYGEN);
      appendLog('startTest(bloodOxygen) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(bloodOxygen) ${formatErr(e)}`);
    }
  }

  async function stopSpo2() {
    try {
      await sdk.stopTest(RealtimeTest.BLOOD_OXYGEN);
      appendLog('stopTest(bloodOxygen) ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startHrv() {
    setHrvResult(null);
    try {
      setActiveTest('hrv');
      await sdk.startTest(RealtimeTest.HRV);
      appendLog('startTest(hrv) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(hrv) ${formatErr(e)}`);
    }
  }

  async function stopHrv() {
    try {
      await sdk.stopTest(RealtimeTest.HRV);
      appendLog('stopTest(hrv) ok');
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
      await sdk.startTest(RealtimeTest.FATIGUE);
      appendLog('startTest(fatigue) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(fatigue) ${formatErr(e)}`);
    }
  }

  async function stopFatigue() {
    try {
      await sdk.stopTest(RealtimeTest.FATIGUE);
      appendLog('stopTest(fatigue) ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startBreathing() {
    setBreathingResult(null);
    try {
      setActiveTest('breathing');
      await sdk.startTest(RealtimeTest.BREATHING);
      appendLog('startTest(breathing) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(breathing) ${formatErr(e)}`);
    }
  }

  async function stopBreathing() {
    try {
      await sdk.stopTest(RealtimeTest.BREATHING);
      appendLog('stopTest(breathing) ok');
    } finally {
      setActiveTest(null);
    }
  }

  async function startBodyComposition() {
    setBodyCompositionResult(null);
    try {
      setActiveTest('bodyComposition');
      await sdk.startTest(RealtimeTest.BODY_COMPOSITION);
      appendLog('startTest(bodyComposition) ok');
    } catch (e) {
      setActiveTest(null);
      appendLog(`startTest(bodyComposition) ${formatErr(e)}`);
    }
  }

  async function stopBodyComposition() {
    try {
      await sdk.stopTest(RealtimeTest.BODY_COMPOSITION);
      appendLog('stopTest(bodyComposition) ok');
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
    bodyCompositionResult,
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
    startBodyComposition,
    stopBodyComposition,
  };
}
