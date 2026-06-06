import type { CapabilityContext } from "../../capabilities/shared/context";
import type { WeatherNativeMethods } from "./native";
import type { WeatherData, WeatherSettings } from "../../types/index";
export declare class WeatherCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<WeatherNativeMethods>);
    readWeatherSettings(): Promise<WeatherSettings>;
    setWeatherSettings(settings: WeatherSettings): Promise<void>;
    pushWeatherData(data: WeatherData): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map