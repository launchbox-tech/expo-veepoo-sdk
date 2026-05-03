import type { VeepooDevice } from "@gaozh1024/expo-veepoo-sdk";
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text } from "react-native";
import { BLUE, RED } from "../../components/theme";

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  disconnectedTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  statusText: { fontSize: 16, color: "#666", textAlign: "center" },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  buttonPrimary: { backgroundColor: BLUE },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});

export default function DisconnectedScreen({
  connectError,
  connectedDevice,
  reconnect,
}: {
  connectError: string | null;
  connectedDevice: VeepooDevice | null;
  reconnect: () => Promise<void>;
}) {
  const isFailedAttempt = connectError != null;
  return (
    <SafeAreaView style={styles.centered}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.disconnectedTitle}>
        {isFailedAttempt ? "Connection Failed" : "Device Disconnected"}
      </Text>
      <Text style={styles.statusText}>
        {isFailedAttempt
          ? connectError
          : `${connectedDevice?.name ?? "The device"} dropped the connection.`}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.buttonPrimary,
          pressed && styles.buttonPressed,
        ]}
        onPress={reconnect}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {isFailedAttempt ? "Try Again" : "Reconnect"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
