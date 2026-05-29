export declare class MerkleTree {
    private leaves;
    private tree;
    build(hashes: string[]): void;
    getRoot(): string;
    getProof(index: number): string[];
    static verifyProof(leafHash: string, proof: string[], root: string): boolean;
    get leafCount(): number;
    get depth(): number;
    private hash;
}
