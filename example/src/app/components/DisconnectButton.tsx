import { Pressable, StyleSheet, Text } from "react-native";
import { RED } from "../../components/theme";

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: RED,
    marginHorizontal: 24,
    marginTop: 8,
  },
  btnPressed: { opacity: 0.82 },
  btnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});

export default function DisconnectButton({
  disconnect,
}: {
  disconnect: () => Promise<void>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      onPress={disconnect}
      accessibilityRole="button"
      accessibilityLabel="Disconnect from device"
    >
      <Text style={styles.btnText}>Disconnect</Text>
    </Pressable>
  );
}
