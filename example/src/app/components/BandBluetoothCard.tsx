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
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "600", color: BLUE },
});

export default function BandBluetoothCard() {
  const [btInfo, setBtInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Band Bluetooth (#108)</Text>
      <Text style={styles.info}>Status: {btInfo}</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => {
            setBtInfo("reading…");
            void sdk
              .readDeviceBTStatus()
              .then((s) => setBtInfo(`open=${s.isBTOpen} state=${s.state}`))
              .catch((e: unknown) => setBtInfo((e as Error)?.message ?? "error"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Read BT</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            setBtInfo("opening…");
            void sdk
              .setDeviceBTSwitch(true)
              .then(() => setBtInfo("opened"))
              .catch((e: unknown) => setBtInfo((e as Error)?.message ?? "error"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Open BT</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            setBtInfo("closing…");
            void sdk
              .setDeviceBTSwitch(false)
              .then(() => setBtInfo("closed"))
              .catch((e: unknown) => setBtInfo((e as Error)?.message ?? "error"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Close BT</Text>
        </Pressable>
      </View>
    </View>
  );
}
