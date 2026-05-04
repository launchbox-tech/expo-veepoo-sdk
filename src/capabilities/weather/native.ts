import type { WeatherData, WeatherSettings } from "../../types/index.js";

export interface WeatherNativeMethods {
  readWeatherSettings(): Promise<unknown>;
  setWeatherSettings(settings: WeatherSettings): Promise<void>;
  pushWeatherData(data: WeatherData): Promise<void>;
}
