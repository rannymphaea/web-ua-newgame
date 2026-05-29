interface ForestConfig {
    numTrees: number;
    sampleSize: number;
    maxDepth?: number;
}
export declare class IsolationForest {
    private trees;
    private readonly config;
    constructor(config: ForestConfig);
    fit(data: number[][]): void;
    anomalyScore(point: number[]): number;
    private buildTree;
    private pathLength;
    private cFactor;
    private subsample;
}
export {};
