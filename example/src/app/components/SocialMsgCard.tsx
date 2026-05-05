import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
import { useVeepooSDK } from "@gaozh1024/expo-veepoo-sdk";
import type { FunctionStatus, OperationStatus, SocialMsgData } from "@gaozh1024/expo-veepoo-sdk";

type Channel = keyof SocialMsgData;

const CHANNEL_LABELS: Record<Channel, string> = {
  phone: "Phone", sms: "SMS", wechat: "WeChat", qq: "QQ",
  facebook: "Facebook", twitter: "Twitter", instagram: "Instagram",
  linkedin: "LinkedIn", whatsapp: "WhatsApp", line: "Line",
  skype: "Skype", email: "Email", other: "Other",
};

const ALL_CHANNELS = Object.keys(CHANNEL_LABELS) as Channel[];

function isTogglable(s: FunctionStatus): boolean {
  return s === "open" || s === "close";
}

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
  success: { color: "#2a7a2a" },
  fail: { color: "#c0392b" },
  channels: { gap: 2 },
  channelRow: { flexDirection: "row", alignItems: "center", paddingVertical: 2 },
  channelName: { flex: 1, fontSize: 13, color: "#333" },
  changedDot: { fontSize: 10, color: BLUE, marginRight: 4 },
  row: { flexDirection: "row", gap: 8, marginTop: 4 },
  button: {
    flex: 1,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#F0F0F0", borderColor: "#DDD" },
  buttonText: { fontSize: 13, fontWeight: "600", color: BLUE },
  buttonTextDisabled: { color: "#AAA" },
});

export default function SocialMsgCard() {
  const { sdk } = useVeepooSDK();
  const [baseState, setBaseState] = useState<SocialMsgData | null>(null);
  const [draft, setDraft] = useState<Partial<Record<Channel, boolean>>>({});
  const [statusMsg, setStatusMsg] = useState("Tap Read to load current channel state.");
  const [writeResult, setWriteResult] = useState<OperationStatus | null>(null);

  async function handleRead() {
    setStatusMsg("Reading…");
    setWriteResult(null);
    try {
      const data = await sdk.socialMsg.readSocialMsgData();
      setBaseState(data);
      setDraft({});
      setStatusMsg("Loaded. Toggle channels then tap Write.");
    } catch (e: unknown) {
      setStatusMsg(`Read failed: ${(e as Error)?.message ?? String(e)}`);
    }
  }

  async function handleWrite() {
    if (!baseState) return;
    const partial: Partial<SocialMsgData> = {};
    for (const ch of ALL_CHANNELS) {
      if (ch in draft) partial[ch] = draft[ch] ? "open" : "close";
    }
    if (Object.keys(partial).length === 0) return;

    setStatusMsg("Writing…");
    setWriteResult(null);
    try {
      const result = await sdk.socialMsg.writeSocialMsgData(partial);
      setWriteResult(result);
      setBaseState(prev => (prev ? { ...prev, ...partial } : prev));
      setDraft({});
      setStatusMsg("Write complete.");
    } catch (e: unknown) {
      setStatusMsg(`Write failed: ${(e as Error)?.message ?? String(e)}`);
    }
  }

  function getChannelOn(ch: Channel): boolean {
    if (ch in draft) return !!draft[ch];
    return baseState?.[ch] === "open";
  }

  function toggleChannel(ch: Channel) {
    setDraft(prev => ({ ...prev, [ch]: !getChannelOn(ch) }));
  }

  const toggleableChannels = baseState
    ? ALL_CHANNELS.filter(ch => isTogglable(baseState[ch]))
    : [];

  const changeCount = Object.keys(draft).length;

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Social Notifications</Text>
      <Text style={styles.info} numberOfLines={2}>{statusMsg}</Text>

      {writeResult !== null && (
        <Text style={[styles.info, writeResult === "success" ? styles.success : styles.fail]}>
          {`Result: ${writeResult}`}
        </Text>
      )}

      {toggleableChannels.length > 0 && (
        <View style={styles.channels}>
          {toggleableChannels.map(ch => (
            <View key={ch} style={styles.channelRow}>
              <Text style={styles.channelName}>{CHANNEL_LABELS[ch]}</Text>
              {ch in draft && <Text style={styles.changedDot}>●</Text>}
              <Switch
                value={getChannelOn(ch)}
                onValueChange={() => toggleChannel(ch)}
                trackColor={{ false: "#ccc", true: "#a8c7fa" }}
                thumbColor={getChannelOn(ch) ? BLUE : "#f4f3f4"}
              />
            </View>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={handleRead} accessibilityRole="button">
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
        <Pressable
          style={[styles.button, changeCount === 0 && styles.buttonDisabled]}
          onPress={handleWrite}
          disabled={changeCount === 0}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, changeCount === 0 && styles.buttonTextDisabled]}>
            {changeCount > 0 ? `Write (${changeCount})` : "Write"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
