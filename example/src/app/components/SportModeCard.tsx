import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
import { useVeepooSDK } from "@gaozh1024/expo-veepoo-sdk";
import { useSDKEvent } from "../../hooks/useSDKEvent";

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

export default function SportModeCard() {
  const { sdk } = useVeepooSDK();
  const [modeInfo, setModeInfo] = useState("—");

  useSDKEvent("sport_mode_data", ({ mode }) => {
    setModeInfo(`[event] mode=${mode ?? "none"}`);
  }, true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Sport Mode</Text>
      <Text style={styles.info} numberOfLines={2}>Mode: {modeInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setModeInfo("reading…");
          void sdk.sportMode.readSportMode()
            .then(s => setModeInfo(JSON.stringify(s)))
            .catch((e: unknown) => setModeInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setModeInfo("setting outdoor_run…");
          void sdk.sportMode.setSportMode("outdoor_run")
            .then(s => setModeInfo(`set: ${s}`))
            .catch((e: unknown) => setModeInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Start run</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setModeInfo("stopping…");
          void sdk.sportMode.stopSportMode()
            .then(s => setModeInfo(`stopped: ${s}`))
            .catch((e: unknown) => setModeInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}
