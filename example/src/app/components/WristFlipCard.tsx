import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { BLUE } from "../../components/theme";
import sdk from "@gaozh1024/expo-veepoo-sdk";
import type { WristFlipWakeSettings } from "@gaozh1024/expo-veepoo-sdk";

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
  findPhase: { fontSize: 14, color: "#555", marginBottom: 4 },
  findRow: { flexDirection: "row", gap: 10 },
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

export default function WristFlipCard({
  wristFlipInfo,
  setWristFlipInfo,
}: {
  wristFlipInfo: string;
  setWristFlipInfo: (info: string) => void;
}) {
  const [lastSettings, setLastSettings] = useState<WristFlipWakeSettings | null>(null);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Wrist-flip wake</Text>
      <Text style={styles.findPhase} numberOfLines={6}>
        {wristFlipInfo}
      </Text>
      <View style={styles.findRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            void sdk
              .readWristFlipWakeSettings()
              .then(s => { setLastSettings(s); setWristFlipInfo(JSON.stringify(s)); })
              .catch(() => setWristFlipInfo("(unsupported or error)"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Read</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            if (!lastSettings) { setWristFlipInfo("read first"); return; }
            void sdk
              .setWristFlipWakeSettings(lastSettings)
              .then(() => setWristFlipInfo(`applied: ${JSON.stringify(lastSettings)}`))
              .catch(() => setWristFlipInfo("(set failed)"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
}
