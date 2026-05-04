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

export default function AlarmsCard() {
  const { sdk } = useVeepooSDK();
  const [alarmsInfo, setAlarmsInfo] = useState("—");
  const [hrAlarmInfo, setHrAlarmInfo] = useState("—");

  useSDKEvent("alarmData", ({ alarms }) => {
    setAlarmsInfo(`[event] ${JSON.stringify(alarms)}`);
  }, true);

  useSDKEvent("heartRateAlarmData", ({ data }) => {
    setHrAlarmInfo(`[event] ${JSON.stringify(data)}`);
  }, true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Alarms</Text>
      <Text style={styles.info} numberOfLines={4}>Alarms: {alarmsInfo}</Text>
      <Text style={styles.info} numberOfLines={3}>HR Alarm: {hrAlarmInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setAlarmsInfo("reading…");
          void sdk.alarms.readAlarms()
            .then(a => setAlarmsInfo(JSON.stringify(a)))
            .catch((e: unknown) => setAlarmsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setAlarmsInfo("setting…");
          void sdk.alarms.setAlarm({ id: 1, hour: 7, minute: 0, isOpen: true, cycle: 0b1111110 })
            .then(s => setAlarmsInfo(`set: ${JSON.stringify(s)}`))
            .catch((e: unknown) => setAlarmsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Set 7:00</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setAlarmsInfo("deleting…");
          void sdk.alarms.deleteAlarm(1)
            .then(s => setAlarmsInfo(`deleted: ${JSON.stringify(s)}`))
            .catch((e: unknown) => setAlarmsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Delete #1</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setHrAlarmInfo("reading…");
          void sdk.alarms.readHeartRateAlarm()
            .then(a => setHrAlarmInfo(JSON.stringify(a)))
            .catch((e: unknown) => setHrAlarmInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read HR alarm</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setHrAlarmInfo("setting…");
          void sdk.alarms.setHeartRateAlarm({ enabled: true, highThreshold: 150, lowThreshold: 50 })
            .then(s => setHrAlarmInfo(`set: ${JSON.stringify(s)}`))
            .catch((e: unknown) => setHrAlarmInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Set HR alarm</Text>
        </Pressable>
      </View>
    </View>
  );
}
