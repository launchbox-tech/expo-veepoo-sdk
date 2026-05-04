import type { Language } from "../../types/index.js";

export interface LanguageNativeMethods {
  setLanguage(language: Language): Promise<boolean>;
}
