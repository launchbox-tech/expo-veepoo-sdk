import type { CapabilityContext } from "@/capabilities/shared/context";

// ── Types ────────────────────────────────────────────────────────────────────

export type Language =
  | "chinese"
  | "chinese_traditional"
  | "english"
  | "japanese"
  | "korean"
  | "german"
  | "russian"
  | "spanish"
  | "italian"
  | "french"
  | "vietnamese"
  | "portuguese"
  | "thai"
  | "polish"
  | "swedish"
  | "turkish"
  | "dutch"
  | "czech"
  | "arabic"
  | "hungarian"
  | "greek"
  | "romanian"
  | "slovak"
  | "indonesian"
  | "brazilian_portuguese"
  | "croatian"
  | "lithuanian"
  | "ukrainian"
  | "hindi"
  | "hebrew"
  | "danish"
  | "persian"
  | "finnish"
  | "malay";

// ── Native methods ──────────────────────────────────────────────────────────

export interface LanguageNativeMethods {
  setLanguage(language: Language): Promise<boolean>;
}

// ── Capability ──────────────────────────────────────────────────────────────

export class LanguageCapability {
  constructor(private readonly ctx: CapabilityContext<LanguageNativeMethods>) {}

  setLanguage(language: Language): Promise<boolean> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.setLanguage(language),
    });
  }
}
