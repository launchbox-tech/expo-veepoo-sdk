import { View, Text, StyleSheet } from "react-native";
import { BLUE } from "../../components/theme";

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  version: { fontSize: 13, color: "#999", marginTop: 4 },
});

export default function ReadyHeader({
  deviceName,
}: {
  deviceName: string | null | undefined;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Session Active</Text>
      <Text style={styles.version}>
        {deviceName ?? "HBand Device"}
      </Text>
    </View>
  );
}
