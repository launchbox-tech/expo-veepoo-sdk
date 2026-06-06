"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCapability = void 0;
// ── Capability ──────────────────────────────────────────────────────────────
class LanguageCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    setLanguage(language) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.setLanguage(language),
        });
    }
}
exports.LanguageCapability = LanguageCapability;
//# sourceMappingURL=language.js.map