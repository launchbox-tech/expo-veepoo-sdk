import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { VeepooDevice } from '@gaozh1024/expo-veepoo-sdk';
import { BLUE } from './theme';

export function DeviceRow({
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

const styles = StyleSheet.create({
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  deviceInfo: { flex: 1, gap: 3 },
  deviceName: { fontSize: 15, fontWeight: '600', color: '#111' },
  deviceMeta: { fontSize: 12, color: '#888' },
  connectBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  connectBtnPressed: { opacity: 0.8 },
  connectBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
