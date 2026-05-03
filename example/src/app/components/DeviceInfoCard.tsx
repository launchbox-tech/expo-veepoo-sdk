import type { BatteryInfo, DeviceVersion } from "@gaozh1024/expo-veepoo-sdk";
import { View, Text, StyleSheet } from "react-native";
import { GREEN } from "../../components/theme";
import { InfoRow } from "../../components";

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
  infoGrid: { gap: 6 },
});

export default function DeviceInfoCard({
  batteryInfo,
  deviceVersion,
}: {
  batteryInfo: BatteryInfo | null;
  deviceVersion: DeviceVersion | null;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Device Info</Text>
      <View style={styles.infoGrid}>
        <InfoRow
          label="Battery"
          value={
            batteryInfo
              ? `${batteryInfo.percent}%${
                  batteryInfo.chargeState === "charging"
                    ? " ⚡"
                    : batteryInfo.isLowBattery
                    ? " ⚠️"
                    : ""
                }`
              : "—"
          }
        />
        <InfoRow
          label="Firmware"
          value={deviceVersion?.firmwareVersion ?? "—"}
        />
      </View>
    </View>
  );
}
