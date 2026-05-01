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
import type { PermissionsResult, PersonalInfo, VeepooDevice } from 'expo-veepoo-sdk';

// State machine: idle → scanning → connecting → ready → disconnected
export type AppState =
  | 'initializing'
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'ready'
  | 'disconnected';

// Default personal info sent to the Band on every deviceReady
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
  const [syncDone, setSyncDone] = useState(false);

  // SDK init + permission request on mount
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

  // deviceFound listener — active only while scanning
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

  // Connection lifecycle listeners — active while connecting or in session
  useEffect(() => {
    if (appState !== 'connecting' && appState !== 'ready') return;

    async function onDeviceReady() {
      setSyncDone(false);
      setAppState('ready');
      await sdk.syncPersonalInfo(DEFAULT_PERSONAL_INFO);
      setSyncDone(true);
    }

    function onDeviceDisconnected() {
      setConnectedDevice(null);
      setSyncDone(false);
      setAppState('disconnected');
    }

    sdk.on('deviceReady', onDeviceReady);
    sdk.on('deviceDisconnected', onDeviceDisconnected);
    return () => {
      sdk.off('deviceReady', onDeviceReady);
      sdk.off('deviceDisconnected', onDeviceDisconnected);
    };
  }, [appState]);

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
    setAppState('idle');
  }, []);

  const handleReconnect = useCallback(async () => {
    setConnectingDevice(null);
    await handleStartScan();
  }, [handleStartScan]);

  const permissionsGranted = permissions?.granted ?? false;

  // Initializing splash
  if (appState === 'initializing') {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.statusText}>Initializing SDK…</Text>
      </SafeAreaView>
    );
  }

  // Connecting splash
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

  // Disconnected state
  if (appState === 'disconnected') {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.disconnectedTitle}>Device Disconnected</Text>
        <Text style={styles.statusText}>
          {connectedDevice?.name ?? 'The device'} dropped the connection.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
          onPress={handleReconnect}
          accessibilityRole="button"
          accessibilityLabel="Reconnect by scanning for devices"
        >
          <Text style={styles.buttonText}>Reconnect</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Ready (session active)
  if (appState === 'ready') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Session Active</Text>
            <Text style={styles.version}>{connectedDevice?.name ?? 'HBand Device'}</Text>
          </View>

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

          {/* Issues #8, #9, #10 will add health test + data sync + device info sections here */}

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

  // Idle / scanning — scan + device list
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
            accessibilityLabel="Stop scanning for devices"
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
            accessibilityLabel="Start scanning for nearby devices"
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

function DeviceRow({
  device,
  onConnect,
}: {
  device: VeepooDevice;
  onConnect: () => void;
}) {
  return (
    <View style={styles.deviceRow}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName} numberOfLines={1}>
          {device.name || 'Unknown Device'}
        </Text>
        <Text style={styles.deviceMeta}>
          {device.rssi} dBm{device.mac ? ` · ${device.mac}` : ''}
        </Text>
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

const BLUE = '#208AEF';
const RED = '#E53935';

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
  },
  version: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  scanControls: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  permissionHint: {
    fontSize: 14,
    color: '#E05C00',
    lineHeight: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  disconnectedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonPrimary: { backgroundColor: BLUE },
  buttonStop: { backgroundColor: RED },
  buttonDisabled: { backgroundColor: '#E5E5E5' },
  buttonPressed: { opacity: 0.82 },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDisabled: { color: '#999' },
  spinnerInline: { marginRight: 4 },
  disconnectBtn: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
    gap: 3,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  deviceMeta: {
    fontSize: 12,
    color: '#888',
  },
  connectBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  connectBtnPressed: { opacity: 0.8 },
  connectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDone: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },
  syncPending: {
    fontSize: 15,
    color: '#666',
  },
});
