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

export default function WorldClockCard() {
  const { sdk } = useVeepooSDK();
  const [clockInfo, setClockInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>World Clock</Text>
      <Text style={styles.info} numberOfLines={3}>Clocks: {clockInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setClockInfo("reading…");
          void sdk.worldClock.readWorldClock()
            .then(c => setClockInfo(JSON.stringify(c)))
            .catch((e: unknown) => setClockInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setClockInfo("setting UTC+5:30…");
          void sdk.worldClock.setWorldClock([
            { timezone_offset_minutes: 330, city_name: "Mumbai" },
            { timezone_offset_minutes: 0,   city_name: "London" },
          ])
            .then(s => setClockInfo(`set: ${s}`))
            .catch((e: unknown) => setClockInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Set 2 clocks</Text>
        </Pressable>
      </View>
    </View>
  );
}
