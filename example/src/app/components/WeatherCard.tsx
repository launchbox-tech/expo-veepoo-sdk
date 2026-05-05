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
  city_name: "TestCity",
  crc: 1,
  hourly: [
    { time: "2024-01-01 09:00", temp_c: 15, temp_f: 59, weather_state: 0, uv_index: 3, wind_level: "2", visibility_m: 10000 },
  ],
  daily: [
    { date: "2024-01-01", max_temp_c: 20, min_temp_c: 10, max_temp_f: 68, min_temp_f: 50, weather_state_day: 0, weather_state_night: 0, uv_index: 3, wind_level: "2" },
  ],
};

export default function WeatherCard() {
  const { sdk } = useVeepooSDK();
  const [info, setInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Weather</Text>
      <Text style={styles.info} numberOfLines={4}>{info}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("reading…");
          void sdk.weather.readWeatherSettings()
            .then(s => setInfo(JSON.stringify(s)))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read settings</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setInfo("setting…");
          void sdk.weather.setWeatherSettings({ is_open: true, unit: "C", crc: 0 })
            .then(() => setInfo("weather enabled (celsius)"))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Enable celsius</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setInfo("pushing…");
          void sdk.weather.pushWeatherData(SAMPLE_WEATHER)
            .then(() => setInfo("weather pushed"))
            .catch((e: unknown) => setInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Push weather</Text>
        </Pressable>
      </View>
    </View>
  );
}
