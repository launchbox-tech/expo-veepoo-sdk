import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { BLUE } from "../../components/theme";
import { useVeepooSDK } from "@gaozh1024/expo-veepoo-sdk";
import type { WatchFaceStyle } from "@gaozh1024/expo-veepoo-sdk";

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

export default function WatchFaceCard() {
  const { sdk } = useVeepooSDK();
  const [watchFaceInfo, setWatchFaceInfo] = useState("—");
  const [lastStyle, setLastStyle] = useState<WatchFaceStyle | null>(null);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Watch face (dial)</Text>
      <Text style={styles.findPhase} numberOfLines={5}>
        {watchFaceInfo}
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            void sdk
              .watchFace.readWatchFaceStyle()
              .then(s => { setLastStyle(s); setWatchFaceInfo(JSON.stringify(s)); })
              .catch(() =>
                setWatchFaceInfo("(unsupported or error — gate with screenStyleFunction)")
              );
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Read dial</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            if (!lastStyle) { setWatchFaceInfo("read first"); return; }
            void sdk
              .watchFace.setWatchFaceStyle({ screenIndex: lastStyle.screenIndex, dialType: lastStyle.dialType })
              .then(() => setWatchFaceInfo(`applied: ${JSON.stringify(lastStyle)}`))
              .catch(() => setWatchFaceInfo("(set failed)"));
          }}
          accessibilityRole="button"
        >
          <Text style={styles.buttonTextSecondary}>Apply dial</Text>
        </Pressable>
      </View>
    </View>
  );
}
