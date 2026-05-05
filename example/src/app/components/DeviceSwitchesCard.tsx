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

export default function DeviceSwitchesCard() {
  const { sdk } = useVeepooSDK();
  const [switchesInfo, setSwitchesInfo] = useState("—");

  useSDKEvent("device_switches_data", ({ switches }) => {
    const on = Object.entries(switches)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ");
    setSwitchesInfo(`[event] on: ${on || "none"}`);
  }, true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Device Switches</Text>
      <Text style={styles.info} numberOfLines={4}>Switches: {switchesInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setSwitchesInfo("reading…");
          void sdk.deviceSwitches.readDeviceSwitches()
            .then(s => {
              const on = Object.entries(s).filter(([, v]) => v).map(([k]) => k).join(", ");
              setSwitchesInfo(`on: ${on || "none"}`);
            })
            .catch((e: unknown) => setSwitchesInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read all</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setSwitchesInfo("enabling auto_hr…");
          void sdk.deviceSwitches.setDeviceSwitch("auto_hr", true)
            .then(s => setSwitchesInfo(`auto_hr on: ${s}`))
            .catch((e: unknown) => setSwitchesInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Enable auto HR</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setSwitchesInfo("toggling disconnect_remind…");
          void sdk.deviceSwitches.setDeviceSwitch("disconnect_remind", true)
            .then(s => setSwitchesInfo(`disconnect_remind on: ${s}`))
            .catch((e: unknown) => setSwitchesInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Disconnect alert</Text>
        </Pressable>
      </View>
    </View>
  );
}
