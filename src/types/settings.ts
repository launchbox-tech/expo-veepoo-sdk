export interface AutoMeasureSetting {
  protocolType: number;
  funType: number;
  isSwitchOpen: boolean;
  stepUnit: number;
  isSlotModify: boolean;
  isIntervalModify: boolean;
  supportStartMinute: number;
  supportEndMinute: number;
  measureInterval: number;
  currentStartMinute: number;
  currentEndMinute: number;
}

export type Language =
  | 'chinese'
  | 'chineseTraditional'
  | 'english'
  | 'japanese'
  | 'korean'
  | 'german'
  | 'russian'
  | 'spanish'
  | 'italian'
  | 'french'
  | 'vietnamese'
  | 'portuguese'
  | 'thai'
  | 'polish'
  | 'swedish'
  | 'turkish'
  | 'dutch'
  | 'czech'
  | 'arabic'
  | 'hungarian'
  | 'greek'
  | 'romanian'
  | 'slovak'
  | 'indonesian'
  | 'brazilianPortuguese'
  | 'croatian'
  | 'lithuanian'
  | 'ukrainian'
  | 'hindi'
  | 'hebrew'
  | 'danish'
  | 'persian'
  | 'finnish'
  | 'malay';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type DistanceUnit = 'metric' | 'imperial';
export type TimeFormat = '12hour' | '24hour';
export type BloodGlucoseUnit = 'mmolL' | 'mgdL';
/** SpO2 apnea alert settings. iOS only — Android rejects with CAPABILITY_UNSUPPORTED. */
export interface ApneaRemindSettings {
  enabled: boolean;
  /** SpO2 threshold (%) below which the apnea alert fires. */
  threshold: number;
}

/** 1 = lightest (closest to white), 6 = darkest. Gate: Android skinType==2, iOS peripheralModel.skinType==2. */
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;
export type CustomSettings = {
  temperatureUnit: TemperatureUnit;
  bloodGlucoseUnit: BloodGlucoseUnit;
  skinTone: SkinTone;
};
export type OperationStatus = 'success' | 'fail' | 'unknown';

export type SportMode =
  | 'outdoorRun' | 'outdoorWalk' | 'indoorRun' | 'indoorWalk' | 'hiking'
  | 'stairStepper' | 'outdoorCycle' | 'stationaryBike' | 'elliptical' | 'rowingMachine'
  | 'mountaineering' | 'swimming' | 'sitUps' | 'skiing' | 'jumpRope'
  | 'yoga' | 'tableTennis' | 'basketball' | 'volleyball' | 'football'
  | 'badminton' | 'tennis' | 'climbStairs' | 'fitness' | 'weightlifting'
  | 'diving' | 'boxing' | 'gymBall' | 'squatTraining' | 'triathlon'
  | 'dance' | 'hiit' | 'rockClimbing' | 'sports' | 'balls'
  | 'fitnessGame' | 'freeTime' | 'aerobics' | 'gymnastics' | 'floorExercise'
  | 'horizontalBar' | 'parallelBars' | 'trampoline' | 'trackAndField' | 'marathon'
  | 'pushUps' | 'dumbbell' | 'rugby' | 'handball' | 'baseballSoftball'
  | 'baseball' | 'hockey' | 'golf' | 'bowling' | 'billiards'
  | 'rowing' | 'sailboat' | 'skating' | 'curling' | 'icePuck'
  | 'sled' | 'strongWalk' | 'treadmill' | 'trailRunning' | 'raceWalking'
  | 'mountainBiking' | 'bmx' | 'orienteering' | 'fishing' | 'hunting'
  | 'skateboard' | 'rollerSkating' | 'parkour' | 'atv' | 'motocross'
  | 'climbingMachine' | 'spinningBike' | 'indoorFitness' | 'mixedAerobic' | 'crossTraining'
  | 'bodybuildingExercise' | 'groupGymnastics' | 'kickboxing' | 'strengthTraining' | 'steppingTraining'
  | 'coreTraining' | 'flexibilityTraining' | 'freeTraining' | 'pilates' | 'battleRope'
  | 'squareDance' | 'ballroomDancing' | 'bellyDance' | 'ballet' | 'hipHop'
  | 'zumba' | 'latinDance' | 'jazz' | 'hipHopDance' | 'poleDancing'
  | 'breakDance' | 'nationalDance' | 'modernDance' | 'disco' | 'tapDance'
  | 'wrestling' | 'martialArts' | 'taiChi' | 'muayThai' | 'judo'
  | 'taekwondo' | 'karate' | 'freeSparring' | 'swordsmanship' | 'jujitsu'
  | 'fencing' | 'beachSoccer' | 'beachVolleyball' | 'softball' | 'squash'
  | 'croquet' | 'cricket' | 'polo' | 'wallball' | 'takrawBall'
  | 'dodgeball' | 'waterPolo';

/** Ordinal→SportMode mapping (indices 1–127; index 0 = 'common' meaning no sport active). */
export const SPORT_MODE_ORDINALS: readonly string[] = [
  'common',
  'outdoorRun', 'outdoorWalk', 'indoorRun', 'indoorWalk', 'hiking',
  'stairStepper', 'outdoorCycle', 'stationaryBike', 'elliptical', 'rowingMachine',
  'mountaineering', 'swimming', 'sitUps', 'skiing', 'jumpRope',
  'yoga', 'tableTennis', 'basketball', 'volleyball', 'football',
  'badminton', 'tennis', 'climbStairs', 'fitness', 'weightlifting',
  'diving', 'boxing', 'gymBall', 'squatTraining', 'triathlon',
  'dance', 'hiit', 'rockClimbing', 'sports', 'balls',
  'fitnessGame', 'freeTime', 'aerobics', 'gymnastics', 'floorExercise',
  'horizontalBar', 'parallelBars', 'trampoline', 'trackAndField', 'marathon',
  'pushUps', 'dumbbell', 'rugby', 'handball', 'baseballSoftball',
  'baseball', 'hockey', 'golf', 'bowling', 'billiards',
  'rowing', 'sailboat', 'skating', 'curling', 'icePuck',
  'sled', 'strongWalk', 'treadmill', 'trailRunning', 'raceWalking',
  'mountainBiking', 'bmx', 'orienteering', 'fishing', 'hunting',
  'skateboard', 'rollerSkating', 'parkour', 'atv', 'motocross',
  'climbingMachine', 'spinningBike', 'indoorFitness', 'mixedAerobic', 'crossTraining',
  'bodybuildingExercise', 'groupGymnastics', 'kickboxing', 'strengthTraining', 'steppingTraining',
  'coreTraining', 'flexibilityTraining', 'freeTraining', 'pilates', 'battleRope',
  'squareDance', 'ballroomDancing', 'bellyDance', 'ballet', 'hipHop',
  'zumba', 'latinDance', 'jazz', 'hipHopDance', 'poleDancing',
  'breakDance', 'nationalDance', 'modernDance', 'disco', 'tapDance',
  'wrestling', 'martialArts', 'taiChi', 'muayThai', 'judo',
  'taekwondo', 'karate', 'freeSparring', 'swordsmanship', 'jujitsu',
  'fencing', 'beachSoccer', 'beachVolleyball', 'softball', 'squash',
  'croquet', 'cricket', 'polo', 'wallball', 'takrawBall',
  'dodgeball', 'waterPolo',
] as const;

/** Current sport mode status on the Band. iOS `readSportMode` returns `mode: null` (vendor limitation). */
export interface SportModeStatus {
  /** The active sport mode, or null if none / iOS read limitation. */
  mode: SportMode | null;
  isActive: boolean;
}
