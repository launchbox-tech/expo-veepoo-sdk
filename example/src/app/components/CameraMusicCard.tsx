import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
  row: { flexDirection: "row", gap: 10 },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
  },
  buttonPressed: { opacity: 0.82 },
  buttonTextSecondary: { fontSize: 14, fontWeight: "600", color: BLUE },
});

export default function CameraMusicCard({
  cameraInfo,
  setCameraInfo,
  musicCommandInfo,
}: {
  cameraInfo: string;
  setCameraInfo: (info: string) => void;
  musicCommandInfo: string;
}) {
  const [musicEnabled, setMusicEnabled] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Camera remote &amp; Music (#107)</Text>
      <Text style={styles.info}>Shutter: {cameraInfo}</Text>
      <Text style={styles.info}>Music cmd: {musicCommandInfo}</Text>
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            void sdk.camera.enterCameraMode().catch(() => setCameraInfo("enterCameraMode error"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Enter camera</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            void sdk.camera.exitCameraMode().then(() => setCameraInfo("—")).catch(() => {});
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Exit camera</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            const next = !musicEnabled;
            setMusicEnabled(next);
            void sdk.music.setMusicControlEnabled(next).catch(() => {});
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>
            Music control: {musicEnabled ? "ON" : "OFF"}
          </Text>
        </Pressable>
        {Platform.OS === "android" && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              void sdk
                .music.pushMusicData({
                  name: "Test Track",
                  artist: "Test Artist",
                  isPlaying: true,
                  volume: 50,
                })
                .catch(() => {});
            }}
            accessibilityRole="button"
          >
            <Text style={styles.buttonTextSecondary}>Push track</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
