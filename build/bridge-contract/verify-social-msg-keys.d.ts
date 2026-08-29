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
export type AndroidSocialMsgChannel = {
    /** The key JS reads. */
    key: string;
    /** The Kotlin function the value is passed through. */
    converter: string;
    /** The `FunctionSocailMsgData` field it reads. */
    field: string;
};
/**
 * Android builds the same channels in one `mapOf(...)`, each entry of the shape
 * `"key" to converter(data.field)`.
 *
 * The converter and field are captured, not just the key: #212 was a converter
 * that could not read the vendor's enum and answered a constant, so a check
 * that only collected keys would have watched it happen.
 */
export declare function extractAndroidSocialMsgChannels(source: string): AndroidSocialMsgChannel[];
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