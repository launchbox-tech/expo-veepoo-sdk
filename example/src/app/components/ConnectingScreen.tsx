import type { VeepooDevice } from "@gaozh1024/expo-veepoo-sdk";
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text } from "react-native";
import { BLUE } from "../../components/theme";

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  statusText: { fontSize: 16, color: "#666", textAlign: "center" },
});

export default function ConnectingScreen({
  connectingDevice,
}: {
  connectingDevice: VeepooDevice | null;
}) {
  return (
    <SafeAreaView style={styles.centered}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ActivityIndicator size="large" color={BLUE} />
      <Text style={styles.statusText}>
        Connecting to {connectingDevice?.name ?? "device"}…
      </Text>
    </SafeAreaView>
  );
}
