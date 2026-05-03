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
  info: { fontSize: 14, color: "#555", marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 14, fontWeight: "600", color: BLUE },
});

export default function GpsAgpsCard() {
  const [gpsInfo, setGpsInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>GPS / AGPS (#106)</Text>
      <Text style={styles.info}>Status: {gpsInfo}</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => {
            setGpsInfo("sending…");
            void sdk
              .setDeviceGPSAndTimezone({
                latitude: 27.7172,
                longitude: 85.324,
                altitude: 1400,
                timezoneOffsetMinutes: 345,
              })
              .then(() => setGpsInfo("sent OK"))
              .catch((e: unknown) => setGpsInfo((e as Error)?.message ?? "error"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Push GPS</Text>
        </Pressable>
      </View>
    </View>
  );
}
