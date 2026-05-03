import type {
  HeartRateTestResult,
  BloodPressureTestResult,
  BloodOxygenTestResult,
} from "@gaozh1024/expo-veepoo-sdk";
import { StyleSheet, Text, View } from "react-native";
import { HealthTestCard } from "../../components";

const styles = StyleSheet.create({
  sectionHeader: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});

export default function HealthTestsSection({
  activeTest,
  hrResult,
  bpResult,
  spo2Result,
  startHR,
  stopHR,
  startBP,
  stopBP,
  startSpo2,
  stopSpo2,
}: {
  activeTest: string | null;
  hrResult: HeartRateTestResult | null;
  bpResult: BloodPressureTestResult | null;
  spo2Result: BloodOxygenTestResult | null;
  startHR: () => Promise<void>;
  stopHR: () => Promise<void>;
  startBP: () => Promise<void>;
  stopBP: () => Promise<void>;
  startSpo2: () => Promise<void>;
  stopSpo2: () => Promise<void>;
}) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Tests</Text>
      </View>
      <HealthTestCard
        label="Heart Rate"
        isActive={activeTest === "hr"}
        disabled={activeTest !== null && activeTest !== "hr"}
        progress={hrResult?.progress}
        state={hrResult?.state}
        resultLine={hrResult?.value != null ? `${hrResult.value} bpm` : null}
        onStart={startHR}
        onStop={stopHR}
      />
      <HealthTestCard
        label="Blood Pressure"
        isActive={activeTest === "bp"}
        disabled={activeTest !== null && activeTest !== "bp"}
        progress={bpResult?.progress}
        state={bpResult?.state}
        resultLine={
          bpResult?.systolic != null
            ? `${bpResult.systolic}/${bpResult.diastolic} mmHg · ${bpResult.pulse} bpm`
            : null
        }
        onStart={startBP}
        onStop={stopBP}
      />
      <HealthTestCard
        label="Blood Oxygen (SpO₂)"
        isActive={activeTest === "spo2"}
        disabled={activeTest !== null && activeTest !== "spo2"}
        progress={spo2Result?.progress}
        state={spo2Result?.state}
        resultLine={spo2Result?.value != null ? `${spo2Result.value}% SpO₂` : null}
        onStart={startSpo2}
        onStop={stopSpo2}
      />
    </>
  );
}
