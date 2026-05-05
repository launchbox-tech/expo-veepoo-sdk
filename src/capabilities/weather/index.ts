import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { WeatherNativeMethods } from "./native.js";
import { normalizeWeatherSettings } from "./normalizers.js";
import { validateWeatherSettings, validateWeatherData } from "./validators.js";
import type { WeatherData, WeatherSettings } from "../../types/index.js";
import { deepCamelKeys } from "../../normalizers/deep-keys.js";

export class WeatherCapability {
  constructor(private readonly ctx: CapabilityContext<WeatherNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readWeatherSettings(): Promise<WeatherSettings> {
    return this.call({
      invoke: () => this.ctx.native.readWeatherSettings(),
      normalize: normalizeWeatherSettings,
    });
  }

  setWeatherSettings(settings: WeatherSettings): Promise<void> {
    return this.call({
      validate: () => validateWeatherSettings(settings),
      invoke: () => this.ctx.native.setWeatherSettings(deepCamelKeys(settings) as WeatherSettings),
    });
  }

  pushWeatherData(data: WeatherData): Promise<void> {
    return this.call({
      validate: () => validateWeatherData(data),
      invoke: () => this.ctx.native.pushWeatherData(deepCamelKeys(data) as WeatherData),
    });
  }
}
