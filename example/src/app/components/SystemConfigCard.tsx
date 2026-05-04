import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
import sdk from "@gaozh1024/expo-veepoo-sdk";
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

export default function SystemConfigCard() {
  const [btInfo, setBtInfo] = useState("—");
  const [connInfo, setConnInfo] = useState("—");
  const [fnInfo, setFnInfo] = useState("—");
  const [sysInfo, setSysInfo] = useState("—");

  useSDKEvent("bluetoothStateChanged", (payload) => {
    setBtInfo(`[event] ${JSON.stringify(payload)}`);
  }, true);

  useSDKEvent("deviceFunction", (payload) => {
    setFnInfo(`[event] ${JSON.stringify(payload.functions ?? payload.data)}`);
  }, true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>System Config</Text>
      <Text style={styles.info} numberOfLines={3}>BT state: {btInfo}</Text>
      <Text style={styles.info} numberOfLines={2}>Connection: {connInfo}</Text>
      <Text style={styles.info} numberOfLines={4}>Functions: {fnInfo}</Text>
      <Text style={styles.info} numberOfLines={2}>System: {sysInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setBtInfo("checking…");
          void sdk.checkBluetoothStatus()
            .then(ok => setBtInfo(`BT enabled: ${ok}`))
            .catch((e: unknown) => setBtInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>BT status</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setConnInfo("reading…");
          void sdk.getConnectionStatus()
            .then(s => setConnInfo(s))
            .catch((e: unknown) => setConnInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Conn status</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setFnInfo("reading…");
          void sdk.readDeviceFunctions()
            .then(f => setFnInfo(JSON.stringify(f)))
            .catch((e: unknown) => setFnInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Functions</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setSysInfo("setting lang…");
          void sdk.setLanguage("en")
            .then(ok => setSysInfo(`setLanguage(en): ${ok}`))
            .catch((e: unknown) => setSysInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Set lang EN</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setSysInfo("syncing time…");
          void sdk.setDeviceTime(new Date())
            .then(ok => setSysInfo(`setDeviceTime: ${ok}`))
            .catch((e: unknown) => setSysInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Sync time</Text>
        </Pressable>
      </View>
    </View>
  );
}
