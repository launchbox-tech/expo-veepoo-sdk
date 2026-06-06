export type CoverageDoc = {
    schemaVersion: number;
    androidSdkSha: string;
    iosSdkSha: string;
    events: Record<string, {
        android: {
            via: string;
        };
        ios: {
            via: string;
        };
    }>;
    notBridged: {
        android: Array<{
            interface: string;
            reason: string;
        }>;
        ios: Array<{
            method: string;
            reason: string;
        }>;
    };
};
export declare function verifyUpstreamSdkCoverage(repoRoot: string): string[];
//# sourceMappingURL=verify-upstream-sdk-coverage.d.ts.map