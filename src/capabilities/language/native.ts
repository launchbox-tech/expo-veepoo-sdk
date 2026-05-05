import type { Language } from "@/types/index";

export interface LanguageNativeMethods {
  setLanguage(language: Language): Promise<boolean>;
}
