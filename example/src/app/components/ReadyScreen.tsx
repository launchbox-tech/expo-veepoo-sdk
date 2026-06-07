import type {
  BatteryInfo,
  DeviceVersion,
  VeepooDevice,
} from "expo-veepoo-sdk";
import { ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlarmsCard from "./AlarmsCard";
import AutoMeasureCard from "./AutoMeasureCard";
import BandBluetoothCard from "./BandBluetoothCard";
import CalibrationCard from "./CalibrationCard";
import CameraMusicCard from "./CameraMusicCard";
import CapabilityExplorer from "./CapabilityExplorer";
import ContactsCard from "./ContactsCard";
import DeviceInfoCard from "./DeviceInfoCard";
import DeviceSwitchesCard from "./DeviceSwitchesCard";
import DisconnectButton from "./DisconnectButton";
import EventLogCard from "./EventLogCard";
import FindBandCard from "./FindBandCard";
import FirmwareDfuCard from "./FirmwareDfuCard";
import GpsAgpsCard from "./GpsAgpsCard";
import HarvestCard from "./HarvestCard";
import HealthTestsSection from "./HealthTestsSection";
import HistoricalDataSection from "./HistoricalDataSection";
import HistoricalQueryCard from "./HistoricalQueryCard";
import PersonalInfoSync from "./PersonalInfoSync";
import ReadyHeader from "./ReadyHeader";
import ScreenLightCard from "./ScreenLightCard";
import SedentaryCard from "./SedentaryCard";
import SessionUtilitiesCard from "./SessionUtilitiesCard";
import SocialMsgCard from "./SocialMsgCard";
import SportModeCard from "./SportModeCard";
import SystemConfigCard from "./SystemConfigCard";
import VitalsLabSection from "./VitalsLabSection";
import WatchFaceCard from "./WatchFaceCard";
import WeatherCard from "./WeatherCard";
import WomenHealthCard from "./WomenHealthCard";
import WorldClockCard from "./WorldClockCard";
import WristFlipCard from "./WristFlipCard";
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

        <HarvestCard />

        <CapabilityExplorer>
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

        <SportModeCard />
        <DeviceSwitchesCard />
        <CalibrationCard />
        <WorldClockCard />
        <SessionUtilitiesCard />

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
        </CapabilityExplorer>

        <DisconnectButton disconnect={disconnect} />

      </ScrollView>
    </SafeAreaView>
  );
}
