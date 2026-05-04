import type {
  BatteryInfo,
  DeviceVersion,
  VeepooDevice,
} from "@gaozh1024/expo-veepoo-sdk";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import {
  ReadyHeader,
  DeviceInfoCard,
  FindBandCard,
  WatchFaceCard,
  ScreenLightCard,
  SedentaryCard,
  WristFlipCard,
  WomenHealthCard,
  CameraMusicCard,
  GpsAgpsCard,
  BandBluetoothCard,
  FirmwareDfuCard,
  AlarmsCard,
  ContactsCard,
  AutoMeasureCard,
  SystemConfigCard,
  WeatherCard,
  SocialMsgCard,
  HistoricalQueryCard,
  PersonalInfoSync,
  HealthTestsSection,
  VitalsLabSection,
  EventLogCard,
  HistoricalDataSection,
  DisconnectButton,
} from "../../components";
import { useHealthTests } from "../../hooks/useHealthTests";
import { useDataSync } from "../../hooks/useDataSync";
import { usePassiveEvents } from "../../hooks/usePassiveEvents";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: 40 },
});

export default function ReadyScreen({
  connectedDevice,
  batteryInfo,
  deviceVersion,
  syncDone,
  disconnect,
}: {
  connectedDevice: VeepooDevice | null;
  batteryInfo: BatteryInfo | null;
  deviceVersion: DeviceVersion | null;
  syncDone: boolean;
  disconnect: () => Promise<void>;
}) {
  const healthTests = useHealthTests();
  const dataSync = useDataSync();
  usePassiveEvents(healthTests.appendLog);

  const {
    hrResult,
    bpResult,
    spo2Result,
    tempResult,
    stressResult,
    bloodGlucoseResult,
    hrvResult,
    ecgResult,
    fatigueResult,
    breathingResult,
    bodyCompositionResult,
    activeTest,
    ecgIncludeWaveform,
    setEcgIncludeWaveform,
    labLog,
    clearLabLog,
    startHR, stopHR,
    startBP, stopBP,
    startSpo2, stopSpo2,
    startTemp, stopTemp,
    startStress, stopStress,
    startBloodGlucose, stopBloodGlucose,
    startHrv, stopHrv,
    startEcg, stopEcg,
    startFatigue, stopFatigue,
    startBreathing, stopBreathing,
    startBodyComposition, stopBodyComposition,
  } = healthTests;

  const { dataSyncing, dataSyncProgress, sleepSummary, stepData, syncData } = dataSync;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <ReadyHeader deviceName={connectedDevice?.name} />

        <DeviceInfoCard batteryInfo={batteryInfo} deviceVersion={deviceVersion} />

        <FindBandCard />
        <WatchFaceCard />
        <ScreenLightCard />
        <SedentaryCard />
        <WristFlipCard />
        <WomenHealthCard />

        <CameraMusicCard />
        <GpsAgpsCard />
        <BandBluetoothCard />
        <AlarmsCard />
        <ContactsCard />
        <AutoMeasureCard />
        <SystemConfigCard />
        <WeatherCard />
        <SocialMsgCard />
        <FirmwareDfuCard />

        <PersonalInfoSync syncDone={syncDone} />

        <HealthTestsSection
          activeTest={activeTest}
          hrResult={hrResult}
          bpResult={bpResult}
          spo2Result={spo2Result}
          startHR={startHR}
          stopHR={stopHR}
          startBP={startBP}
          stopBP={stopBP}
          startSpo2={startSpo2}
          stopSpo2={stopSpo2}
        />

        <VitalsLabSection
          activeTest={activeTest}
          tempResult={tempResult}
          stressResult={stressResult}
          bloodGlucoseResult={bloodGlucoseResult}
          hrvResult={hrvResult}
          ecgResult={ecgResult}
          fatigueResult={fatigueResult}
          breathingResult={breathingResult}
          bodyCompositionResult={bodyCompositionResult}
          ecgIncludeWaveform={ecgIncludeWaveform}
          setEcgIncludeWaveform={setEcgIncludeWaveform}
          startTemp={startTemp}
          stopTemp={stopTemp}
          startStress={startStress}
          stopStress={stopStress}
          startBloodGlucose={startBloodGlucose}
          stopBloodGlucose={stopBloodGlucose}
          startHrv={startHrv}
          stopHrv={stopHrv}
          startEcg={startEcg}
          stopEcg={stopEcg}
          startFatigue={startFatigue}
          stopFatigue={stopFatigue}
          startBreathing={startBreathing}
          stopBreathing={stopBreathing}
          startBodyComposition={startBodyComposition}
          stopBodyComposition={stopBodyComposition}
        />

        <EventLogCard labLog={labLog} clearLabLog={clearLabLog} />

        <HistoricalQueryCard />

        <HistoricalDataSection
          dataSyncing={dataSyncing}
          dataSyncProgress={dataSyncProgress}
          sleepSummary={sleepSummary}
          stepData={stepData}
          syncData={syncData}
        />

        <DisconnectButton disconnect={disconnect} />

      </ScrollView>
    </SafeAreaView>
  );
}
