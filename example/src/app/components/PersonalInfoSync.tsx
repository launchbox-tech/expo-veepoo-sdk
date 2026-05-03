import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { BLUE, GREEN } from "../../components/theme";

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: "#F5F9FF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  syncRow: { flexDirection: "row", alignItems: "center" },
  syncDone: { fontSize: 15, color: GREEN, fontWeight: "600" },
  syncPending: { fontSize: 15, color: "#666" },
});

export default function PersonalInfoSync({ syncDone }: { syncDone: boolean }) {
  return (
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
  );
}
