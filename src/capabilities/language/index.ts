import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { LanguageNativeMethods } from "./native";
import type { Language } from "@/types/index";

export class LanguageCapability {
  constructor(private readonly ctx: CapabilityContext<LanguageNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  setLanguage(language: Language): Promise<boolean> {
    return this.call({
      invoke: () => this.ctx.native.setLanguage(language),
    });
  }
}
