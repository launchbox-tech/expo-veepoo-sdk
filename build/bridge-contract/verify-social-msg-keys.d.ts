export type IosSocialMsgKeys = {
    /** Channels in the "all unsupported" dictionary the function starts from. */
    seeded: string[];
    /** Channels actually assigned a decoded ANCS byte afterwards. */
    assigned: string[];
};
/**
 * iOS seeds every channel as "unsupported", then overwrites each from the ANCS
 * bytes. Both halves are extracted: a channel that is seeded but never assigned
 * reports a constant "unsupported" — the same silent-constant defect as #212,
 * just reached a different way.
 */
export declare function extractIosSocialMsgKeys(source: string): IosSocialMsgKeys;
/** Android builds the same channels in one `mapOf(...)`. */
export declare function extractAndroidSocialMsgKeys(source: string): string[];
/**
 * Fails when the social-message channel names drift between the two native
 * emitters and the JS list that reads them.
 *
 * Keys only. The platforms legitimately differ on VALUES — iOS decodes ANCS
 * bytes and never reports "support", while Android maps the vendor enum and
 * can report "support" or "unknown". All are valid `FunctionStatus`.
 *
 * The vendor struct carries 26 channels and both platforms bridge 13; that
 * asymmetry is deliberate scope, so the vendor is not part of the comparison.
 */
export declare function verifySocialMsgKeysContract(repoRoot: string): string[];
//# sourceMappingURL=verify-social-msg-keys.d.ts.map