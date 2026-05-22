import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WeatherNativeMethods } from "./native";
import { normalizeWeatherSettings } from "./normalizers";
import { validateWeatherSettings, validateWeatherData } from "./validators";
import type { WeatherData, WeatherSettings } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WeatherCapability {
  constructor(private readonly ctx: CapabilityContext<WeatherNativeMethods>) {}

  readWeatherSettings(): Promise<WeatherSettings> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readWeatherSettings(),
      normalize: normalizeWeatherSettings,
    });
  }

  setWeatherSettings(settings: WeatherSettings): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateWeatherSettings(settings),
      invoke: () => this.ctx.native.setWeatherSettings(deepCamelKeys(settings) as WeatherSettings),
    });
  }

  pushWeatherData(data: WeatherData): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateWeatherData(data),
      invoke: () => this.ctx.native.pushWeatherData(deepCamelKeys(data) as WeatherData),
    });
  }
}
