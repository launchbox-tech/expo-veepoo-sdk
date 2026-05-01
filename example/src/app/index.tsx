import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import sdk from 'expo-veepoo-sdk';
import type {
  BatteryInfo,
  BloodOxygenTestResult,
  BloodPressureTestResult,
  ConnectionStatus,
  DeviceVersion,
  HeartRateTestResult,
  PermissionsResult,
  PersonalInfo,
  ReadOriginProgress,
  SleepData,
  SportStepData,
  VeepooDevice,
} from 'expo-veepoo-sdk';

// State machine: idle → scanning → connecting → ready → disconnected
export type AppState =
  | 'initializing'
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'ready'
  | 'disconnected';

const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  sex: 1,
  height: 175,
  weight: 70,
  age: 30,
  stepAim: 8000,
  sleepAim: 480,
};

export default function Index() {
  const [appState, setAppState] = useState<AppState>('initializing');
  const [permissions, setPermissions] = useState<PermissionsResult | null>(null);
  const [devices, setDevices] = useState<VeepooDevice[]>([]);
  const [connectingDevice, setConnectingDevice] = useState<VeepooDevice | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<VeepooDevice | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [syncDone, setSyncDone] = useState(false);

  // Health tests
  const [hrResult, setHrResult] = useState<HeartRateTestResult | null>(null);
  const [bpResult, setBpResult] = useState<BloodPressureTestResult | null>(null);
  const [spo2Result, setSpo2Result] = useState<BloodOxygenTestResult | null>(null);
  const [activeTest, setActiveTest] = useState<'hr' | 'bp' | 'spo2' | null>(null);

  // Device info (#10)
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [deviceVersion, setDeviceVersion] = useState<DeviceVersion | null>(null);

  // Historical data sync (#9)
  const [dataSyncing, setDataSyncing] = useState(false);
  const [dataSyncProgress, setDataSyncProgress] = useState<ReadOriginProgress | null>(null);
  const [sleepSummary, setSleepSummary] = useState<SleepData['summary'] | null>(null);
  const [stepData, setStepData] = useState<SportStepData | null>(null);

  // ─── SDK init ────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function setup() {
      await sdk.init();
      const result = await sdk.requestPermissions();
      if (!cancelled) {
        setPermissions(result);
        setAppState('idle');
      }
    }
    setup();
    return () => { cancelled = true; };
  }, []);

  // ─── Scan ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (appState !== 'scanning') return;

    function onDeviceFound({ device }: { device: VeepooDevice; timestamp: number }) {
      setDevices(prev => {
        const idx = prev.findIndex(d => d.id === device.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = device;
          return next;
        }
        return [...prev, device];
      });
    }

    sdk.on('deviceFound', onDeviceFound);
    return () => { sdk.off('deviceFound', onDeviceFound); };
  }, [appState]);

  // ─── Connection lifecycle ────────────────────────────────────────────────────

  useEffect(() => {
    if (appState !== 'connecting' && appState !== 'ready') return;

    async function onDeviceReady() {
      setSyncDone(false);
      setBatteryInfo(null);
      setDeviceVersion(null);
      setDataSyncing(false);
      setDataSyncProgress(null);
      setSleepSummary(null);
      setStepData(null);
      setAppState('ready');

      // Run personal info sync and device info reads concurrently
      const [, battery, version] = await Promise.allSettled([
        sdk.syncPersonalInfo(DEFAULT_PERSONAL_INFO),
        sdk.readBattery(),
        sdk.readDeviceVersion(),
      ]);

      setSyncDone(true);
      if (battery.status === 'fulfilled') setBatteryInfo(battery.value);
      if (version.status === 'fulfilled') setDeviceVersion(version.value);
    }

    function onDeviceDisconnected() {
      setConnectedDevice(null);
      setSyncDone(false);
      setActiveTest(null);
      setHrResult(null);
      setBpResult(null);
      setSpo2Result(null);
      setBatteryInfo(null);
      setDeviceVersion(null);
      setDataSyncing(false);
      setDataSyncProgress(null);
      setConnectError(null);
      setAppState('disconnected');
    }

    function onConnectStatus({ status, code }: { deviceId: string; status: ConnectionStatus; code?: number }) {
      if (status === 'error') {
        setConnectError(
          code != null
            ? `Connection failed (code ${code}). Is the device nearby?`
            : 'Connection failed. Make sure the device is nearby and try again.'
        );
        setConnectingDevice(null);
        setConnectedDevice(null);
        setAppState('disconnected');
      }
    }

    sdk.on('deviceReady', onDeviceReady);
    sdk.on('deviceDisconnected', onDeviceDisconnected);
    sdk.on('deviceConnectStatus', onConnectStatus);
    return () => {
      sdk.off('deviceReady', onDeviceReady);
      sdk.off('deviceDisconnected', onDeviceDisconnected);
      sdk.off('deviceConnectStatus', onConnectStatus);
    };
  }, [appState]);

  // ─── Health test listeners (ready state only) ─────────────────────────────

  useEffect(() => {
    if (appState !== 'ready') return;

    function onHR({ result }: { deviceId: string; result: HeartRateTestResult }) {
      setHrResult(result);
      if (result.state === 'over' || result.state === 'error' || result.state === 'notWear') {
        setActiveTest(prev => (prev === 'hr' ? null : prev));
      }
    }
    function onBP({ result }: { deviceId: string; result: BloodPressureTestResult }) {
      setBpResult(result);
      if (result.state === 'over' || result.state === 'error' || result.state === 'notWear') {
        setActiveTest(prev => (prev === 'bp' ? null : prev));
      }
    }
    function onSpo2({ result }: { deviceId: string; result: BloodOxygenTestResult }) {
      setSpo2Result(result);
      if (result.state === 'over' || result.state === 'error' || result.state === 'notWear') {
        setActiveTest(prev => (prev === 'spo2' ? null : prev));
      }
    }

    sdk.on('heartRateTestResult', onHR);
    sdk.on('bloodPressureTestResult', onBP);
    sdk.on('bloodOxygenTestResult', onSpo2);
    return () => {
      sdk.off('heartRateTestResult', onHR);
      sdk.off('bloodPressureTestResult', onBP);
      sdk.off('bloodOxygenTestResult', onSpo2);
    };
  }, [appState]);

  // ─── Data sync listeners (ready state only) ──────────────────────────────

  useEffect(() => {
    if (appState !== 'ready') return;

    function onSyncProgress({ progress }: { deviceId: string; progress: ReadOriginProgress }) {
      setDataSyncProgress(progress);
    }
    function onSyncComplete() {
      setDataSyncing(false);
    }
    function onSleepData({ data }: { deviceId: string; date: string; data: SleepData }) {
      setSleepSummary(data.summary);
    }
    function onStepData({ data }: { deviceId: string; date: string; data: SportStepData }) {
      setStepData(data);
    }
    function onBatteryData({ data }: { deviceId: string; data: BatteryInfo }) {
      setBatteryInfo(data);
    }

    sdk.on('readOriginProgress', onSyncProgress);
    sdk.on('readOriginComplete', onSyncComplete);
    sdk.on('sleepData', onSleepData);
    sdk.on('sportStepData', onStepData);
    sdk.on('batteryData', onBatteryData);
    return () => {
      sdk.off('readOriginProgress', onSyncProgress);
      sdk.off('readOriginComplete', onSyncComplete);
      sdk.off('sleepData', onSleepData);
      sdk.off('sportStepData', onStepData);
      sdk.off('batteryData', onBatteryData);
    };
  }, [appState]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleStartScan = useCallback(async () => {
    setDevices([]);
    setAppState('scanning');
    await sdk.startScan();
  }, []);

  const handleStopScan = useCallback(async () => {
    await sdk.stopScan();
    setAppState('idle');
  }, []);

  const handleConnect = useCallback(async (device: VeepooDevice) => {
    await sdk.stopScan();
    setConnectingDevice(device);
    setConnectedDevice(device);
    setAppState('connecting');
    await sdk.connect(device.id);
  }, []);

  const handleDisconnect = useCallback(async () => {
    await sdk.disconnect();
    setConnectedDevice(null);
    setSyncDone(false);
    setActiveTest(null);
    setHrResult(null);
    setBpResult(null);
    setSpo2Result(null);
    setBatteryInfo(null);
    setDeviceVersion(null);
    setDataSyncing(false);
    setDataSyncProgress(null);
    setConnectError(null);
    setAppState('idle');
  }, []);

  const handleReconnect = useCallback(async () => {
    setConnectingDevice(null);
    setConnectError(null);
    await handleStartScan();
  }, [handleStartScan]);

  const handleStartHR = useCallback(async () => {
    setHrResult(null);
    setActiveTest('hr');
    await sdk.startHeartRateTest();
  }, []);

  const handleStartBP = useCallback(async () => {
    setBpResult(null);
    setActiveTest('bp');
    await sdk.startBloodPressureTest();
  }, []);

  const handleStartSpo2 = useCallback(async () => {
    setSpo2Result(null);
    setActiveTest('spo2');
    await sdk.startBloodOxygenTest();
  }, []);

  const handleSyncData = useCallback(async () => {
    setDataSyncing(true);
    setDataSyncProgress(null);
    setSleepSummary(null);
    setStepData(null);
    await sdk.startReadOriginData();
  }, []);

  const permissionsGranted = permissions?.granted ?? false;

  // ─── Render ───────────────────────────────────────────────────────────────

  if (appState === 'initializing') {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.statusText}>Initializing SDK…</Text>
      </SafeAreaView>
    );
  }

  if (appState === 'connecting') {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.statusText}>
          Connecting to {connectingDevice?.name ?? 'device'}…
        </Text>
      </SafeAreaView>
    );
  }

  if (appState === 'disconnected') {
    const isFailedAttempt = connectError != null;
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.disconnectedTitle}>
          {isFailedAttempt ? 'Connection Failed' : 'Device Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          {isFailedAttempt
            ? connectError
            : `${connectedDevice?.name ?? 'The device'} dropped the connection.`}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
          onPress={handleReconnect}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {isFailedAttempt ? 'Try Again' : 'Reconnect'}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (appState === 'ready') {
    const syncPct = dataSyncProgress?.progress ?? 0;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.title}>Session Active</Text>
            <Text style={styles.version}>{connectedDevice?.name ?? 'HBand Device'}</Text>
          </View>

          {/* ── Device Info (#10) ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Device Info</Text>
            <View style={styles.infoGrid}>
              <InfoRow
                label="Battery"
                value={
                  batteryInfo
                    ? `${batteryInfo.percent}%${batteryInfo.chargeState === 'charging' ? ' ⚡' : batteryInfo.isLowBattery ? ' ⚠️' : ''}`
                    : '—'
                }
              />
              <InfoRow
                label="Firmware"
                value={deviceVersion?.firmwareVersion ?? '—'}
              />
            </View>
          </View>

          {/* ── Personal Info Sync ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Personal Info Sync</Text>
            <View style={styles.syncRow}>
              {syncDone ? (
                <Text style={styles.syncDone}>✓ Synced</Text>
              ) : (
                <>
                  <ActivityIndicator size="small" color={BLUE} />
                  <Text style={styles.syncPending}> Syncing…</Text>
                </>
              )}
            </View>
          </View>

          {/* ── Health Tests (#8) ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Tests</Text>
          </View>

          <HealthTestCard
            label="Heart Rate"
            unit="BPM"
            isActive={activeTest === 'hr'}
            disabled={activeTest !== null && activeTest !== 'hr'}
            progress={hrResult?.progress}
            state={hrResult?.state}
            resultLine={hrResult?.value != null ? `${hrResult.value} bpm` : null}
            onStart={handleStartHR}
          />
          <HealthTestCard
            label="Blood Pressure"
            unit="mmHg"
            isActive={activeTest === 'bp'}
            disabled={activeTest !== null && activeTest !== 'bp'}
            progress={bpResult?.progress}
            state={bpResult?.state}
            resultLine={
              bpResult?.systolic != null
                ? `${bpResult.systolic}/${bpResult.diastolic} mmHg · ${bpResult.pulse} bpm`
                : null
            }
            onStart={handleStartBP}
          />
          <HealthTestCard
            label="Blood Oxygen (SpO₂)"
            unit="%"
            isActive={activeTest === 'spo2'}
            disabled={activeTest !== null && activeTest !== 'spo2'}
            progress={spo2Result?.progress}
            state={spo2Result?.state}
            resultLine={spo2Result?.value != null ? `${spo2Result.value}% SpO₂` : null}
            onStart={handleStartSpo2}
          />

          {/* ── Historical Data Sync (#9) ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historical Data</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.testCardRow}>
              <Text style={styles.testLabel}>Sync Data</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.testBtn,
                  dataSyncing ? styles.testBtnActive : styles.testBtnIdle,
                  pressed && !dataSyncing && styles.buttonPressed,
                ]}
                disabled={dataSyncing}
                onPress={handleSyncData}
                accessibilityRole="button"
                accessibilityLabel="Sync historical data from device"
                accessibilityState={{ disabled: dataSyncing }}
              >
                {dataSyncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.testBtnText}>Sync</Text>
                )}
              </Pressable>
            </View>

            {dataSyncing && dataSyncProgress && (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${syncPct}%` }]} />
                </View>
                <Text style={styles.syncProgressLabel}>
                  Day {dataSyncProgress.currentDay}/{dataSyncProgress.totalDays} · {Math.round(syncPct)}%
                </Text>
              </>
            )}

            {!dataSyncing && stepData && (
              <View style={styles.dataSummary}>
                <Text style={styles.dataSummaryTitle}>Today's Steps</Text>
                <Text style={styles.dataSummaryValue}>{stepData.stepCount.toLocaleString()}</Text>
                <Text style={styles.dataSummaryMeta}>
                  {(stepData.distance / 1000).toFixed(2)} km · {Math.round(stepData.calories)} kcal
                </Text>
              </View>
            )}

            {!dataSyncing && sleepSummary && (
              <View style={styles.dataSummary}>
                <Text style={styles.dataSummaryTitle}>Last Night's Sleep</Text>
                <Text style={styles.dataSummaryValue}>
                  {Math.floor(sleepSummary.totalSleepMinutes / 60)}h {sleepSummary.totalSleepMinutes % 60}m
                </Text>
                <Text style={styles.dataSummaryMeta}>
                  Deep {sleepSummary.totalDeepSleepMinutes}m · Light {sleepSummary.totalLightSleepMinutes}m · Woke {sleepSummary.totalWakeUpCount}×
                </Text>
              </View>
            )}
          </View>

          {/* ── Disconnect ── */}
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonStop, pressed && styles.buttonPressed, styles.disconnectBtn]}
            onPress={handleDisconnect}
            accessibilityRole="button"
            accessibilityLabel="Disconnect from device"
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Idle / Scanning ──────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>HBand Connect</Text>
        <Text style={styles.version}>expo-veepoo-sdk v1.2.7</Text>
      </View>

      <View style={styles.scanControls}>
        {!permissionsGranted && (
          <Text style={styles.permissionHint}>
            Bluetooth permission is required to scan for devices.
          </Text>
        )}

        {appState === 'scanning' ? (
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonStop, pressed && styles.buttonPressed]}
            onPress={handleStopScan}
            accessibilityRole="button"
          >
            <ActivityIndicator size="small" color="#fff" style={styles.spinnerInline} />
            <Text style={styles.buttonText}>Stop Scan</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              permissionsGranted ? styles.buttonPrimary : styles.buttonDisabled,
              pressed && permissionsGranted && styles.buttonPressed,
            ]}
            disabled={!permissionsGranted}
            onPress={handleStartScan}
            accessibilityRole="button"
            accessibilityState={{ disabled: !permissionsGranted }}
          >
            <Text style={[styles.buttonText, !permissionsGranted && styles.buttonTextDisabled]}>
              Start Scan
            </Text>
          </Pressable>
        )}
      </View>

      {(appState === 'scanning' || devices.length > 0) && (
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Scanning for nearby HBand devices…</Text>
          }
          renderItem={({ item }) => (
            <DeviceRow device={item} onConnect={() => handleConnect(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DeviceRow({ device, onConnect }: { device: VeepooDevice; onConnect: () => void }) {
  return (
    <View style={styles.deviceRow}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName} numberOfLines={1}>{device.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceMeta}>{device.rssi} dBm{device.mac ? ` · ${device.mac}` : ''}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.connectBtn, pressed && styles.connectBtnPressed]}
        onPress={onConnect}
        accessibilityRole="button"
        accessibilityLabel={`Connect to ${device.name ?? 'device'}`}
      >
        <Text style={styles.connectBtnText}>Connect</Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function HealthTestCard({
  label, isActive, disabled, progress, state, resultLine, onStart,
}: {
  label: string;
  unit: string;
  isActive: boolean;
  disabled: boolean;
  progress?: number;
  state?: string;
  resultLine: string | null;
  onStart: () => void;
}) {
  const stateMsg =
    state === 'notWear' ? 'Please wear the device.' :
    state === 'error' ? 'Test error — try again.' : null;

  return (
    <View style={styles.card}>
      <View style={styles.testCardRow}>
        <Text style={styles.testLabel}>{label}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.testBtn,
            isActive ? styles.testBtnActive : disabled ? styles.testBtnDisabled : styles.testBtnIdle,
            pressed && !disabled && styles.buttonPressed,
          ]}
          disabled={disabled || isActive}
          onPress={onStart}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || isActive }}
        >
          {isActive
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={[styles.testBtnText, disabled && styles.testBtnTextDisabled]}>Start</Text>
          }
        </Pressable>
      </View>
      {isActive && progress != null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
      {!isActive && resultLine && <Text style={styles.testResult}>{resultLine}</Text>}
      {stateMsg && <Text style={styles.testStateMsg}>{stateMsg}</Text>}
    </View>
  );
}

// ─── Constants & Styles ───────────────────────────────────────────────────────

const BLUE = '#208AEF';
const RED = '#E53935';
const GREEN = '#2E7D32';

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 },
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', letterSpacing: -0.5 },
  version: { fontSize: 13, color: '#999', marginTop: 4 },
  sectionHeader: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.6 },
  scanControls: { paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  permissionHint: { fontSize: 14, color: '#E05C00', lineHeight: 20 },
  statusText: { fontSize: 16, color: '#666', textAlign: 'center' },
  disconnectedTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  button: { height: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonPrimary: { backgroundColor: BLUE },
  buttonStop: { backgroundColor: RED },
  buttonDisabled: { backgroundColor: '#E5E5E5' },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  buttonTextDisabled: { color: '#999' },
  spinnerInline: { marginRight: 4 },
  disconnectBtn: { marginHorizontal: 24, marginTop: 8 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 24 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F9FF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  deviceInfo: { flex: 1, gap: 3 },
  deviceName: { fontSize: 15, fontWeight: '600', color: '#111' },
  deviceMeta: { fontSize: 12, color: '#888' },
  connectBtn: { backgroundColor: BLUE, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  connectBtnPressed: { opacity: 0.8 },
  connectBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  card: { marginHorizontal: 24, marginBottom: 12, backgroundColor: '#F5F9FF', borderRadius: 12, padding: 16, gap: 8 },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoGrid: { gap: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  syncRow: { flexDirection: 'row', alignItems: 'center' },
  syncDone: { fontSize: 15, color: GREEN, fontWeight: '600' },
  syncPending: { fontSize: 15, color: '#666' },
  testCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  testLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  testBtn: { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 16, minWidth: 64, alignItems: 'center' },
  testBtnIdle: { backgroundColor: BLUE },
  testBtnActive: { backgroundColor: '#999' },
  testBtnDisabled: { backgroundColor: '#E5E5E5' },
  testBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  testBtnTextDisabled: { color: '#bbb' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: BLUE, borderRadius: 3 },
  testResult: { fontSize: 20, fontWeight: '700', color: '#111' },
  testStateMsg: { fontSize: 13, color: '#E05C00' },
  syncProgressLabel: { fontSize: 12, color: '#888' },
  dataSummary: { borderTopWidth: 1, borderTopColor: '#E5EDF7', paddingTop: 10, gap: 2 },
  dataSummaryTitle: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.4 },
  dataSummaryValue: { fontSize: 22, fontWeight: '700', color: '#111' },
  dataSummaryMeta: { fontSize: 12, color: '#888' },
});
