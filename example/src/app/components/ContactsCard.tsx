import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
import { useVeepooSDK } from "@gaozh1024/expo-veepoo-sdk";
import { useSDKEvent } from "../../hooks/useSDKEvent";

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
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    flex: 1,
    minWidth: 90,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C5D9F5",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 13, fontWeight: "600", color: BLUE },
});

export default function ContactsCard() {
  const { sdk } = useVeepooSDK();
  const [contactsInfo, setContactsInfo] = useState("—");
  const [sosInfo, setSosInfo] = useState("—");

  useSDKEvent("contactsData", ({ contacts }) => {
    setContactsInfo(`[event] ${contacts.length} contacts`);
  }, true);

  useSDKEvent("sosCallTimesData", ({ data }) => {
    setSosInfo(`[event] ${JSON.stringify(data)}`);
  }, true);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Contacts &amp; SOS</Text>
      <Text style={styles.info} numberOfLines={4}>Contacts: {contactsInfo}</Text>
      <Text style={styles.info} numberOfLines={3}>SOS Times: {sosInfo}</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setContactsInfo("reading…");
          void sdk.contacts.readContacts()
            .then(c => setContactsInfo(`${c.length} contacts: ${JSON.stringify(c)}`))
            .catch((e: unknown) => setContactsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setContactsInfo("adding…");
          void sdk.contacts.addContact({ name: "Test", phone: "1234567890" })
            .then(() => setContactsInfo("added Test / 1234567890"))
            .catch((e: unknown) => setContactsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setContactsInfo("deleting…");
          void sdk.contacts.deleteContact(1)
            .then(() => setContactsInfo("deleted id=1"))
            .catch((e: unknown) => setContactsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Delete #1</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setContactsInfo("setting SOS…");
          void sdk.contacts.setContactSosState(1, true)
            .then(() => setContactsInfo("SOS enabled id=1"))
            .catch((e: unknown) => setContactsInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>SOS on #1</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => {
          setSosInfo("reading…");
          void sdk.sos.readSosCallTimes()
            .then(s => setSosInfo(JSON.stringify(s)))
            .catch((e: unknown) => setSosInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Read SOS times</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          setSosInfo("setting…");
          void sdk.sos.setSosCallTimes(3)
            .then(() => setSosInfo("set to 3"))
            .catch((e: unknown) => setSosInfo((e as Error)?.message ?? "error"));
        }} accessibilityRole="button">
          <Text style={styles.buttonText}>Set 3 times</Text>
        </Pressable>
      </View>
    </View>
  );
}
