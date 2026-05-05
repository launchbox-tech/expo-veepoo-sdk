import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
import { useVeepooSDK } from "@gaozh1024/expo-veepoo-sdk";

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
  info: { fontSize: 13, color: "#555" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    flex: 1,
    minWidth: 90,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 13, fontWeight: "600", color: BLUE },
});

export default function CalibrationCard() {
  const { sdk } = useVeepooSDK();
  const [bpInfo, setBpInfo] = useState("—");
  const [glucoseInfo, setGlucoseInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Sensor Calibration</Text>
      <Text style={styles.info} numberOfLines={2}>BP calibration: {bpInfo}</Text>
      <Text style={styles.info} numberOfLines={2}>Glucose calibration: {glucoseInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setBpInfo("calibrating 120/80…");
          void sdk.calibration.calibrateBloodPressure(120, 80)
            .then(s => setBpInfo(`BP 120/80: ${s}`))
            .catch((e: unknown) => setBpInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Cal BP 120/80</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setGlucoseInfo("calibrating 5.5…");
          void sdk.calibration.calibrateBloodGlucose(5.5)
            .then(s => setGlucoseInfo(`glucose 5.5: ${s}`))
            .catch((e: unknown) => setGlucoseInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Cal glucose 5.5</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setGlucoseInfo("setting risk levels…");
          void sdk.calibration.setBloodGlucoseRiskLevel({ low: 4, high: 10, unit: "mmol_l" })
            .then(s => setGlucoseInfo(`risk low=4/high=10: ${s}`))
            .catch((e: unknown) => setGlucoseInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Risk 4–10 mmol/L</Text>
        </Pressable>
      </View>
    </View>
  );
}
