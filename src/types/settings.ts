export interface AutoMeasureSetting {
  protocol_type: number;
  fun_type: number;
  is_switch_open: boolean;
  step_unit: number;
  is_slot_modify: boolean;
  is_interval_modify: boolean;
  support_start_minute: number;
  support_end_minute: number;
  measure_interval: number;
  current_start_minute: number;
  current_end_minute: number;
}

export type Language =
  | 'chinese'
  | 'chinese_traditional'
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
  | 'brazilian_portuguese'
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
export type BloodGlucoseUnit = 'mmol_l' | 'mg_dl';
/** SpO2 apnea alert settings. iOS only — Android rejects with CAPABILITY_UNSUPPORTED. */
export interface ApneaRemindSettings {
  enabled: boolean;
  /** SpO2 threshold (%) below which the apnea alert fires. */
  threshold: number;
}

/** 1 = lightest (closest to white), 6 = darkest. Gate: Android skinType==2, iOS peripheralModel.skinType==2. */
export type SkinTone = 1 | 2 | 3 | 4 | 5 | 6;
export type CustomSettings = {
  temperature_unit: TemperatureUnit;
  blood_glucose_unit: BloodGlucoseUnit;
  skin_tone: SkinTone;
};
export type OperationStatus = 'success' | 'fail' | 'unknown';

export type SportMode =
  | 'outdoor_run' | 'outdoor_walk' | 'indoor_run' | 'indoor_walk' | 'hiking'
  | 'stair_stepper' | 'outdoor_cycle' | 'stationary_bike' | 'elliptical' | 'rowing_machine'
  | 'mountaineering' | 'swimming' | 'sit_ups' | 'skiing' | 'jump_rope'
  | 'yoga' | 'table_tennis' | 'basketball' | 'volleyball' | 'football'
  | 'badminton' | 'tennis' | 'climb_stairs' | 'fitness' | 'weightlifting'
  | 'diving' | 'boxing' | 'gym_ball' | 'squat_training' | 'triathlon'
  | 'dance' | 'hiit' | 'rock_climbing' | 'sports' | 'balls'
  | 'fitness_game' | 'free_time' | 'aerobics' | 'gymnastics' | 'floor_exercise'
  | 'horizontal_bar' | 'parallel_bars' | 'trampoline' | 'track_and_field' | 'marathon'
  | 'push_ups' | 'dumbbell' | 'rugby' | 'handball' | 'baseball_softball'
  | 'baseball' | 'hockey' | 'golf' | 'bowling' | 'billiards'
  | 'rowing' | 'sailboat' | 'skating' | 'curling' | 'ice_puck'
  | 'sled' | 'strong_walk' | 'treadmill' | 'trail_running' | 'race_walking'
  | 'mountain_biking' | 'bmx' | 'orienteering' | 'fishing' | 'hunting'
  | 'skateboard' | 'roller_skating' | 'parkour' | 'atv' | 'motocross'
  | 'climbing_machine' | 'spinning_bike' | 'indoor_fitness' | 'mixed_aerobic' | 'cross_training'
  | 'bodybuilding_exercise' | 'group_gymnastics' | 'kickboxing' | 'strength_training' | 'stepping_training'
  | 'core_training' | 'flexibility_training' | 'free_training' | 'pilates' | 'battle_rope'
  | 'square_dance' | 'ballroom_dancing' | 'belly_dance' | 'ballet' | 'hip_hop'
  | 'zumba' | 'latin_dance' | 'jazz' | 'hip_hop_dance' | 'pole_dancing'
  | 'break_dance' | 'national_dance' | 'modern_dance' | 'disco' | 'tap_dance'
  | 'wrestling' | 'martial_arts' | 'tai_chi' | 'muay_thai' | 'judo'
  | 'taekwondo' | 'karate' | 'free_sparring' | 'swordsmanship' | 'jujitsu'
  | 'fencing' | 'beach_soccer' | 'beach_volleyball' | 'softball' | 'squash'
  | 'croquet' | 'cricket' | 'polo' | 'wallball' | 'takraw_ball'
  | 'dodgeball' | 'water_polo';

/** Ordinal→SportMode mapping (indices 1–127; index 0 = 'common' meaning no sport active). */
export const SPORT_MODE_ORDINALS: readonly string[] = [
  'common',
  'outdoor_run', 'outdoor_walk', 'indoor_run', 'indoor_walk', 'hiking',
  'stair_stepper', 'outdoor_cycle', 'stationary_bike', 'elliptical', 'rowing_machine',
  'mountaineering', 'swimming', 'sit_ups', 'skiing', 'jump_rope',
  'yoga', 'table_tennis', 'basketball', 'volleyball', 'football',
  'badminton', 'tennis', 'climb_stairs', 'fitness', 'weightlifting',
  'diving', 'boxing', 'gym_ball', 'squat_training', 'triathlon',
  'dance', 'hiit', 'rock_climbing', 'sports', 'balls',
  'fitness_game', 'free_time', 'aerobics', 'gymnastics', 'floor_exercise',
  'horizontal_bar', 'parallel_bars', 'trampoline', 'track_and_field', 'marathon',
  'push_ups', 'dumbbell', 'rugby', 'handball', 'baseball_softball',
  'baseball', 'hockey', 'golf', 'bowling', 'billiards',
  'rowing', 'sailboat', 'skating', 'curling', 'ice_puck',
  'sled', 'strong_walk', 'treadmill', 'trail_running', 'race_walking',
  'mountain_biking', 'bmx', 'orienteering', 'fishing', 'hunting',
  'skateboard', 'roller_skating', 'parkour', 'atv', 'motocross',
  'climbing_machine', 'spinning_bike', 'indoor_fitness', 'mixed_aerobic', 'cross_training',
  'bodybuilding_exercise', 'group_gymnastics', 'kickboxing', 'strength_training', 'stepping_training',
  'core_training', 'flexibility_training', 'free_training', 'pilates', 'battle_rope',
  'square_dance', 'ballroom_dancing', 'belly_dance', 'ballet', 'hip_hop',
  'zumba', 'latin_dance', 'jazz', 'hip_hop_dance', 'pole_dancing',
  'break_dance', 'national_dance', 'modern_dance', 'disco', 'tap_dance',
  'wrestling', 'martial_arts', 'tai_chi', 'muay_thai', 'judo',
  'taekwondo', 'karate', 'free_sparring', 'swordsmanship', 'jujitsu',
  'fencing', 'beach_soccer', 'beach_volleyball', 'softball', 'squash',
  'croquet', 'cricket', 'polo', 'wallball', 'takraw_ball',
  'dodgeball', 'water_polo',
] as const;

/** Current sport mode status on the Band. iOS `readSportMode` returns `mode: null` (vendor limitation). */
export interface SportModeStatus {
  /** The active sport mode, or null if none / iOS read limitation. */
  mode: SportMode | null;
  is_active: boolean;
}

export interface BloodGlucoseRiskConfig {
  low: number;
  high: number;
  unit: BloodGlucoseUnit;
}

export interface WorldClockEntry {
  timezone_offset_minutes: number;
  city_name: string;
  dst_offset?: number;
}
