import { StyleSheet, Text, View } from "react-native";

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
  info: { fontSize: 14, color: "#555" },
  bold: { fontWeight: "600" },
});

export default function FirmwareDfuCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Firmware DFU (local file)</Text>
      <Text style={styles.info} numberOfLines={8}>
        Use{" "}
        <Text style={styles.bold}>startLocalFirmwareDfu(path)</Text>{" "}
        from your host app with a vendor OTA package. Subscribe to{" "}
        <Text style={styles.bold}>firmwareDfuProgress</Text>. Android:
        JL-platform Bands only. This example does not run DFU.
      </Text>
    </View>
  );
}
