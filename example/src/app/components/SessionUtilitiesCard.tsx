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
  buttonText: { fontSize: 13, fontWeight: "600", color: BLUE },
});

export default function SessionUtilitiesCard() {
  const { sdk } = useVeepooSDK();
  const [renameInfo, setRenameInfo] = useState("—");
  const [confirmInfo, setConfirmInfo] = useState("—");

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Session Utilities</Text>
      <Text style={styles.info} numberOfLines={2}>Rename: {renameInfo}</Text>
      <Text style={styles.info} numberOfLines={2}>Conn confirm: {confirmInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setRenameInfo("renaming…");
          void sdk.session.renameDevice("MyBand")
            .then(s => setRenameInfo(`rename: ${s}`))
            .catch((e: unknown) => setRenameInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Rename "MyBand"</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setConfirmInfo("reading…");
          void sdk.session.isConnectionConfirmEnabled()
            .then(b => setConfirmInfo(`confirm enabled: ${b}`))
            .catch((e: unknown) => setConfirmInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read confirm</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setConfirmInfo("disabling…");
          void sdk.session.setConnectionConfirmEnabled(false)
            .then(s => setConfirmInfo(`confirm off: ${s}`))
            .catch((e: unknown) => setConfirmInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Disable confirm</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setConfirmInfo("setting timeout 30s…");
          void sdk.session.setConnectionConfirmTimeout(30)
            .then(s => setConfirmInfo(`timeout 30s: ${s}`))
            .catch((e: unknown) => setConfirmInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Timeout 30s</Text>
        </Pressable>
      </View>
    </View>
  );
}
