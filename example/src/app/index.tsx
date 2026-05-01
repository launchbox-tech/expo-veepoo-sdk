import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import sdk from 'expo-veepoo-sdk';
import type { PermissionsResult, VeepooDevice } from 'expo-veepoo-sdk';

// State machine: idle → scanning → connecting → ready → disconnected
export type AppState =
  | 'initializing'
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'ready'
  | 'disconnected';

export default function Index() {
  const [appState, setAppState] = useState<AppState>('initializing');
  const [permissions, setPermissions] = useState<PermissionsResult | null>(null);
  const [devices, setDevices] = useState<VeepooDevice[]>([]);

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
          // update RSSI for already-known device
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

  const handleStartScan = useCallback(async () => {
    setDevices([]);
    setAppState('scanning');
    await sdk.startScan();
  }, []);

  const handleStopScan = useCallback(async () => {
    await sdk.stopScan();
    setAppState('idle');
  }, []);

  const permissionsGranted = permissions?.granted ?? false;

  if (appState === 'initializing') {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.statusText}>Initializing SDK…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>HBand Connect</Text>
        <Text style={styles.version}>expo-veepoo-sdk v1.2.7</Text>
      </View>

      {/* Scan controls */}
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

      {/* Device list — visible while scanning or after a scan found something */}
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
            <DeviceRow
              device={item}
              onConnect={() => {
                // Issue #7: call sdk.connect(item.id) and transition to 'connecting'
              }}
            />
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
    gap: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});
