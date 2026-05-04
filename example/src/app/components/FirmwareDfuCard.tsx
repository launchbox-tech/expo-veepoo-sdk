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
  info: { fontSize: 14, color: "#555" },
  bold: { fontWeight: "600" },
  warn: { fontSize: 12, color: "#E06000" },
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

export default function FirmwareDfuCard() {
  const { sdk } = useVeepooSDK();
  const [dfuInfo, setDfuInfo] = useState("—");

  useSDKEvent("firmwareDfuProgress", ({ state, progress }) => {
    setDfuInfo(`state=${state} progress=${progress}%`);
  }, true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Firmware DFU (local file)</Text>
      <Text style={styles.info}>Progress: {dfuInfo}</Text>
      <Text style={styles.info} numberOfLines={4}>
        Subscribe to <Text style={styles.bold}>firmwareDfuProgress</Text> for state/progress.
        Android: JL-platform Bands only.
      </Text>
      {__DEV__ && (
        <>
          <Text style={styles.warn}>Dev only — may brick Band. Use a real vendor OTA package path.</Text>
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={() => {
              setDfuInfo("starting…");
              void sdk.dfu.startLocalFirmwareDfu("/path/to/firmware.bin")
                .then(() => setDfuInfo("DFU started"))
                .catch((e: unknown) => setDfuInfo((e as Error)?.message ?? "error"));
            }} accessibilityRole="button">
              <Text style={styles.buttonText}>Start DFU (dev)</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
