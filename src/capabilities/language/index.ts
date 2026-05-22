import type { CapabilityContext } from "@/capabilities/shared/context";
import type { LanguageNativeMethods } from "./native";
import type { Language } from "@/types/index";

export class LanguageCapability {
  constructor(private readonly ctx: CapabilityContext<LanguageNativeMethods>) {}

  setLanguage(language: Language): Promise<boolean> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.setLanguage(language),
    });
  }
}
