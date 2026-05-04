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
  buttonText: { fontSize: 12, fontWeight: "600", color: BLUE },
});

export default function HistoricalQueryCard() {
  const { sdk } = useVeepooSDK();
  const [info, setInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Historical Queries</Text>
      <Text style={styles.info} numberOfLines={6}>{info}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading all data…");
          void sdk.historicalQuery.readDeviceAllData()
            .then(ok => setInfo(`readDeviceAllData: ${ok}`))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>All data</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading sleep…");
          void sdk.sleepData.readSleepData()
            .then(s => setInfo(`sleep: ${s.length} records`))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Sleep</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading steps…");
          void sdk.sportSteps.readSportStepData()
            .then(s => setInfo(`steps: ${JSON.stringify(s)}`))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Steps</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading day summary…");
          void sdk.daySummary.readDaySummaryData()
            .then(s => setInfo(`summary: ${JSON.stringify(s)}`))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Day summary</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading origin…");
          void sdk.originData.readOriginData()
            .then(d => setInfo(`origin: ${d.length} records`))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Origin data</Text>
        </Pressable>
      </View>
    </View>
  );
}
