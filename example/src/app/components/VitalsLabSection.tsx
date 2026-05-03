import type {
  HrvTestResult,
  EcgTestResult,
  FatigueTestResult,
  BreathingTestResult,
  BodyCompositionTestResult,
} from "@gaozh1024/expo-veepoo-sdk";
import { StyleSheet, Switch, Text, View } from "react-native";
import { BLUE } from "../../components/theme";
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
  ecgWaveformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5EDF7",
  },
  ecgWaveformLabel: { fontSize: 13, color: "#555" },
});

export default function VitalsLabSection({
  activeTest,
  hrvResult,
  ecgResult,
  fatigueResult,
  breathingResult,
  bodyCompositionResult,
  ecgIncludeWaveform,
  setEcgIncludeWaveform,
  startHrv,
  stopHrv,
  startEcg,
  stopEcg,
  startFatigue,
  stopFatigue,
  startBreathing,
  stopBreathing,
  startBodyComposition,
  stopBodyComposition,
}: {
  activeTest: string | null;
  hrvResult: HrvTestResult | null;
  ecgResult: EcgTestResult | null;
  fatigueResult: FatigueTestResult | null;
  breathingResult: BreathingTestResult | null;
  bodyCompositionResult: BodyCompositionTestResult | null;
  ecgIncludeWaveform: boolean;
  setEcgIncludeWaveform: (v: boolean) => void;
  startHrv: () => Promise<void>;
  stopHrv: () => Promise<void>;
  startEcg: () => Promise<void>;
  stopEcg: () => Promise<void>;
  startFatigue: () => Promise<void>;
  stopFatigue: () => Promise<void>;
  startBreathing: () => Promise<void>;
  stopBreathing: () => Promise<void>;
  startBodyComposition: () => Promise<void>;
  stopBodyComposition: () => Promise<void>;
}) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vitals lab</Text>
      </View>
      <HealthTestCard
        label="HRV (manual)"
        isActive={activeTest === "hrv"}
        disabled={activeTest !== null && activeTest !== "hrv"}
        progress={hrvResult?.progress}
        state={typeof hrvResult?.state === "string" ? hrvResult.state : undefined}
        resultLine={hrvResult?.value != null ? `${hrvResult.value}` : null}
        onStart={startHrv}
        onStop={stopHrv}
      />
      <HealthTestCard
        label="ECG"
        isActive={activeTest === "ecg"}
        disabled={activeTest !== null && activeTest !== "ecg"}
        progress={ecgResult?.progress}
        state={typeof ecgResult?.state === "string" ? ecgResult.state : undefined}
        resultLine={
          ecgResult?.heartRate != null
            ? `HR ${ecgResult.heartRate}${
                ecgResult.hrv != null ? ` · HRV ${ecgResult.hrv}` : ""
              }${
                ecgResult.waveform?.length
                  ? ` · ${ecgResult.waveform.length} waveform samples`
                  : ""
              }`
            : null
        }
        footer={
          <View style={styles.ecgWaveformRow}>
            <Text style={styles.ecgWaveformLabel}>Include waveform</Text>
            <Switch
              value={ecgIncludeWaveform}
              onValueChange={setEcgIncludeWaveform}
              disabled={activeTest === "ecg"}
            />
          </View>
        }
        onStart={startEcg}
        onStop={stopEcg}
      />
      <HealthTestCard
        label="Fatigue"
        isActive={activeTest === "fatigue"}
        disabled={activeTest !== null && activeTest !== "fatigue"}
        progress={fatigueResult?.progress}
        state={typeof fatigueResult?.state === "string" ? fatigueResult.state : undefined}
        resultLine={fatigueResult?.level != null ? `Level ${fatigueResult.level}` : null}
        onStart={startFatigue}
        onStop={stopFatigue}
      />
      <HealthTestCard
        label="Breathing rate"
        isActive={activeTest === "breathing"}
        disabled={activeTest !== null && activeTest !== "breathing"}
        progress={breathingResult?.progress}
        state={typeof breathingResult?.state === "string" ? breathingResult.state : undefined}
        resultLine={breathingResult?.rate != null ? `${breathingResult.rate} bpm` : null}
        onStart={startBreathing}
        onStop={stopBreathing}
      />
      <HealthTestCard
        label="Body composition (#102)"
        isActive={activeTest === "bodyComposition"}
        disabled={activeTest !== null && activeTest !== "bodyComposition"}
        progress={bodyCompositionResult?.progress}
        state={
          typeof bodyCompositionResult?.state === "string"
            ? bodyCompositionResult.state
            : undefined
        }
        resultLine={
          bodyCompositionResult?.composition?.bmi != null
            ? `BMI ${bodyCompositionResult.composition.bmi.toFixed(1)}`
            : bodyCompositionResult?.composition?.bodyFatPercentage != null
            ? `Fat ${bodyCompositionResult.composition.bodyFatPercentage}%`
            : null
        }
        onStart={startBodyComposition}
        onStop={stopBodyComposition}
      />
    </>
  );
}
