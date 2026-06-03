export declare function sha256(input: string): string;
export declare function hashChain(prevHash: string, currentData: unknown): string;
export declare function diffKeys(before: Record<string, unknown>, after: Record<string, unknown>): string[];
