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

const SAMPLE_WEATHER = {
  cityName: "TestCity",
  crc: 1,
  hourly: [
    { time: "2024-01-01 09:00", tempC: 15, tempF: 59, weatherState: 0, uvIndex: 3, windLevel: "2", visibilityM: 10000 },
  ],
  daily: [
    { date: "2024-01-01", highTempC: 20, lowTempC: 10, highTempF: 68, lowTempF: 50, weatherState: 0, uvIndex: 3, sunriseTime: "06:00", sunsetTime: "18:00", windLevel: "2", windDirection: 90 },
  ],
};

export default function WeatherCard() {
  const [info, setInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Weather</Text>
      <Text style={styles.info} numberOfLines={4}>{info}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading…");
          void sdk.readWeatherSettings()
            .then(s => setInfo(JSON.stringify(s)))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read settings</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setInfo("setting…");
          void sdk.setWeatherSettings({ isOpen: true, unit: "celsius", crc: 0 })
            .then(() => setInfo("weather enabled (celsius)"))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Enable celsius</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("pushing…");
          void sdk.pushWeatherData(SAMPLE_WEATHER)
            .then(() => setInfo("weather pushed"))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Push weather</Text>
        </Pressable>
      </View>
    </View>
  );
}
