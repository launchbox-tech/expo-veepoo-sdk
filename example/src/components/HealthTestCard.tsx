import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BLUE, RED } from './theme';

export function HealthTestCard({
  label,
  isActive,
  disabled,
  progress,
  state,
  resultLine,
  footer,
  onStart,
  onStop,
}: {
  label: string;
  isActive: boolean;
  disabled: boolean;
  progress?: number;
  state?: string;
  resultLine: string | null;
  footer?: ReactNode;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
}) {
  const stateMsg =
    state === 'notWear'
      ? 'Please wear the device.'
      : state === 'error'
      ? 'Test error — try again.'
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.testCardRow}>
        <Text style={styles.testLabel}>{label}</Text>
        {isActive ? (
          <Pressable
            style={({ pressed }) => [
              styles.testBtn,
              styles.testBtnStop,
              pressed && styles.buttonPressed,
            ]}
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel={`Stop ${label} test`}
          >
            <Text style={styles.testBtnText}>Stop</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.testBtn,
              disabled ? styles.testBtnDisabled : styles.testBtnIdle,
              pressed && !disabled && styles.buttonPressed,
            ]}
            disabled={disabled}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
          >
            <Text style={[styles.testBtnText, disabled && styles.testBtnTextDisabled]}>
              Start
            </Text>
          </Pressable>
        )}
      </View>
      {isActive && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress ?? 0}%` }]} />
        </View>
      )}
      {!isActive && resultLine && <Text style={styles.testResult}>{resultLine}</Text>}
      {stateMsg && <Text style={styles.testStateMsg}>{stateMsg}</Text>}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  testCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  testBtn: {
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    minWidth: 64,
    alignItems: 'center',
  },
  testBtnIdle: { backgroundColor: BLUE },
  testBtnStop: { backgroundColor: RED },
  testBtnDisabled: { backgroundColor: '#E5E5E5' },
  testBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  testBtnTextDisabled: { color: '#bbb' },
  buttonPressed: { opacity: 0.82 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: BLUE, borderRadius: 3 },
  testResult: { fontSize: 20, fontWeight: '700', color: '#111' },
  testStateMsg: { fontSize: 13, color: '#E05C00' },
});
