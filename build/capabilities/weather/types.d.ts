/** Weather temperature unit. Vendor `EWeatherType` / `VPWeatherConfigModel.weatherUnit`. */
export type WeatherUnit = 'C' | 'F';
/** Weather switch + unit state. Android `WeatherStatusData`; iOS `VPWeatherConfigModel`. */
export interface WeatherSettings {
    is_open: boolean;
    unit: WeatherUnit;
    /** CRC of current weather on device; pass back when pushing data to skip no-op updates. */
    crc: number;
}
/** 3-hour forecast entry. Android `WeatherEvery3Hour`; iOS `VPWeatherServerHourlyModel`. */
export interface WeatherHourlyForecast {
    /** ISO datetime "YYYY-MM-DD HH:mm" */
    time: string;
    temp_c: number;
    temp_f: number;
    /** Weather state code 0–155 (sunny→cloudy→rain→snow). See vendor docs for ranges. */
    weather_state: number;
    uv_index: number;
    /** Wind level e.g. "3" or "3-5". */
    wind_level: string;
    /** Visibility in metres. */
    visibility_m: number;
}
/** Daily forecast entry. Android `WeatherEveryDay`; iOS `VPWeatherServerForecastModel`. */
export interface WeatherDailyForecast {
    /** ISO date "YYYY-MM-DD" */
    date: string;
    max_temp_c: number;
    min_temp_c: number;
    max_temp_f: number;
    min_temp_f: number;
    weather_state_day: number;
    weather_state_night: number;
    uv_index?: number;
    wind_level?: string;
    visibility_m?: number;
}
/** Full weather payload to push to the Band. Android `WeatherData`; iOS `VPWeatherServerModel`. */
export interface WeatherData {
    city_name: string;
    /** CRC uniqueness key — Band skips write when CRC matches stored value. */
    crc: number;
    latitude?: number;
    longitude?: number;
    hourly: WeatherHourlyForecast[];
    daily: WeatherDailyForecast[];
}
//# sourceMappingURL=types.d.ts.map