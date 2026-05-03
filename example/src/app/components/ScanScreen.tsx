import type { VeepooDevice, PermissionsResult } from "@gaozh1024/expo-veepoo-sdk";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BLUE, RED } from "../../components/theme";
import { DeviceRow } from "../../components";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  version: { fontSize: 13, color: "#999", marginTop: 4 },
  scanControls: { paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  permissionHint: { fontSize: 14, color: "#E05C00", lineHeight: 20 },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonPrimary: { backgroundColor: BLUE },
  buttonStop: { backgroundColor: RED },
  buttonDisabled: { backgroundColor: "#E5E5E5" },
  buttonPressed: { opacity: 0.82 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  buttonTextDisabled: { color: "#999" },
  spinnerInline: { marginRight: 4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
  },
});

export default function ScanScreen({
  permissions,
  appState,
  devices,
  startScan,
  stopScan,
  connect,
}: {
  permissions: PermissionsResult | null;
  appState: string;
  devices: VeepooDevice[];
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  connect: (device: VeepooDevice) => Promise<void>;
}) {
  const permissionsGranted = permissions?.granted ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>HBand Connect</Text>
        <Text style={styles.version}>@gaozh1024/expo-veepoo-sdk v1.2.11</Text>
      </View>

      <View style={styles.scanControls}>
        {!permissionsGranted && permissions?.canAskAgain === false ? (
          <>
            <Text style={styles.permissionHint}>
              Bluetooth access was permanently denied. Open Settings to grant
              permission.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
              accessibilityLabel="Open app settings to grant Bluetooth permission"
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </Pressable>
          </>
        ) : !permissionsGranted ? (
          <Text style={styles.permissionHint}>
            Bluetooth permission is required to scan for devices.
          </Text>
        ) : null}

        {appState === "scanning" ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonStop,
              pressed && styles.buttonPressed,
            ]}
            onPress={stopScan}
            accessibilityRole="button"
          >
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.spinnerInline}
            />
            <Text style={styles.buttonText}>Stop Scan</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              permissionsGranted ? styles.buttonPrimary : styles.buttonDisabled,
              pressed && permissionsGranted && styles.buttonPressed,
            ]}
            disabled={!permissionsGranted}
            onPress={startScan}
            accessibilityRole="button"
            accessibilityState={{ disabled: !permissionsGranted }}
          >
            <Text
              style={[
                styles.buttonText,
                !permissionsGranted && styles.buttonTextDisabled,
              ]}
            >
              Start Scan
            </Text>
          </Pressable>
        )}
      </View>

      {(appState === "scanning" || devices.length > 0) && (
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Scanning for nearby HBand devices…
            </Text>
          }
          renderItem={({ item }) => (
            <DeviceRow device={item} onConnect={() => connect(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
