import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import sdk from 'expo-veepoo-sdk';
import type { PermissionsResult } from 'expo-veepoo-sdk';

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
    return () => {
      cancelled = true;
    };
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

      <View style={styles.section}>
        {!permissionsGranted && (
          <Text style={styles.permissionHint}>
            Bluetooth permission is required to scan for devices.
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            permissionsGranted ? styles.buttonPrimary : styles.buttonDisabled,
            pressed && permissionsGranted && styles.buttonPressed,
          ]}
          disabled={!permissionsGranted}
          onPress={() => {
            // Issue #6: call sdk.startScan() and transition to 'scanning'
          }}
          accessibilityRole="button"
          accessibilityState={{ disabled: !permissionsGranted }}
          accessibilityLabel="Start Scan"
          accessibilityHint="Scans for nearby HBand devices via Bluetooth"
        >
          <Text
            style={[
              styles.buttonText,
              !permissionsGranted && styles.buttonTextDisabled,
            ]}
          >
            Start Scan
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 24,
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
  section: {
    gap: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
  },
  permissionHint: {
    fontSize: 14,
    color: '#E05C00',
    lineHeight: 20,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#208AEF',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
