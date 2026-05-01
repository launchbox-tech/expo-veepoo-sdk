import { StyleSheet, Text, View } from 'react-native';

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111' },
});
