import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";

/**
 * Collapsible wrapper for the per-capability demo cards. Keeps the parity
 * regression harness (CONTEXT.md "Example app" rule) one tap away while the
 * Harvest stays the headline. Collapsed by default.
 */
export default function CapabilityExplorer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={styles.headerText}>
          <Text style={styles.title}>Capability Explorer</Text>
          <Text style={styles.sub}>Per-capability controls for parity testing</Text>
        </View>
        <Text style={styles.chevron}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20 },
  header: {
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F2F4F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: { opacity: 0.85 },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#111" },
  sub: { fontSize: 12, color: "#889", marginTop: 2 },
  chevron: { fontSize: 14, color: BLUE, marginLeft: 12 },
  body: { marginTop: 8 },
});
