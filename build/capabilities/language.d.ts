import type { CapabilityContext } from "../capabilities/shared/context";
export type Language = "chinese" | "chinese_traditional" | "english" | "japanese" | "korean" | "german" | "russian" | "spanish" | "italian" | "french" | "vietnamese" | "portuguese" | "thai" | "polish" | "swedish" | "turkish" | "dutch" | "czech" | "arabic" | "hungarian" | "greek" | "romanian" | "slovak" | "indonesian" | "brazilian_portuguese" | "croatian" | "lithuanian" | "ukrainian" | "hindi" | "hebrew" | "danish" | "persian" | "finnish" | "malay";
export interface LanguageNativeMethods {
    setLanguage(language: Language): Promise<boolean>;
}
export declare class LanguageCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<LanguageNativeMethods>);
    setLanguage(language: Language): Promise<boolean>;
}
//# sourceMappingURL=language.d.ts.map