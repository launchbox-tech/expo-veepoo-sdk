import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
import sdk from "@gaozh1024/expo-veepoo-sdk";

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
  row: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
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

export default function AutoMeasureCard() {
  const [info, setInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Auto-Measure Settings</Text>
      <Text style={styles.info} numberOfLines={6}>{info}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading…");
          void sdk.autoMeasure.readAutoMeasureSetting()
            .then(s => setInfo(JSON.stringify(s)))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setInfo("modifying…");
          void sdk.autoMeasure.modifyAutoMeasureSetting({ measureInterval: 30 })
            .then(s => setInfo(`modified: ${JSON.stringify(s)}`))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Set interval 30</Text>
        </Pressable>
      </View>
    </View>
  );
}
