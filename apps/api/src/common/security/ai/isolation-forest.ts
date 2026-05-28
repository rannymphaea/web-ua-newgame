/**
 * IsolationForest — Pure TypeScript Implementation
 * Algorithm: Liu, Fei Tony, Kai Ming Ting, and Zhi-Hua Zhou (2008)
 *
 * Isolation Forest works by randomly partitioning data.
 * Anomalies require fewer splits to isolate → lower average path length.
 * Normal points require more splits → higher average path length.
 *
 * Output: anomaly_score ∈ [0, 1]
 *   → 0.0 = definitely normal
 *   → 1.0 = definitely anomalous
 *   → 0.5 = indeterminate
 */

interface ForestConfig {
  numTrees: number;     // Number of isolation trees (default: 100)
  sampleSize: number;   // Sub-sample size per tree (default: 256)
  maxDepth?: number;    // Max tree depth (default: ceil(log2(sampleSize)))
}

interface IsolationNode {
  left?: IsolationNode;
  right?: IsolationNode;
  featureIndex?: number;
  splitValue?: number;
  size: number;
  isLeaf: boolean;
}

export class IsolationForest {
  private trees: IsolationNode[] = [];
  private readonly config: Required<ForestConfig>;

  constructor(config: ForestConfig) {
    this.config = {
      numTrees: config.numTrees,
      sampleSize: config.sampleSize,
      maxDepth: config.maxDepth ?? Math.ceil(Math.log2(config.sampleSize)),
    };
  }

  /** Train the forest on a dataset */
  fit(data: number[][]): void {
    if (data.length === 0) return;
    this.trees = [];

    for (let t = 0; t < this.config.numTrees; t++) {
      const sample = this.subsample(data, this.config.sampleSize);
      const tree   = this.buildTree(sample, 0);
      this.trees.push(tree);
    }
  }

  /**
   * Compute anomaly score for a single data point.
   * @returns score ∈ [0, 1]. Higher = more anomalous.
   */
  anomalyScore(point: number[]): number {
    if (this.trees.length === 0) return 0.5;

    const avgPathLength = this.trees.reduce((sum, tree) => {
      return sum + this.pathLength(point, tree, 0);
    }, 0) / this.trees.length;

    const c = this.cFactor(this.config.sampleSize);
    // 2^(-avgPathLength/c) maps path length to [0,1] anomaly score
    return Math.pow(2, -(avgPathLength / c));
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private buildTree(data: number[][], depth: number): IsolationNode {
    if (depth >= this.config.maxDepth || data.length <= 1) {
      return { size: data.length, isLeaf: true };
    }

    const numFeatures = data[0].length;
    const featureIndex = Math.floor(Math.random() * numFeatures);

    // Find min/max of selected feature
    let min = Infinity, max = -Infinity;
    for (const point of data) {
      if (point[featureIndex] < min) min = point[featureIndex];
      if (point[featureIndex] > max) max = point[featureIndex];
    }

    if (min === max) {
      return { size: data.length, isLeaf: true };
    }

    const splitValue = min + Math.random() * (max - min);

    const left  = data.filter(p => p[featureIndex] < splitValue);
    const right = data.filter(p => p[featureIndex] >= splitValue);

    return {
      featureIndex,
      splitValue,
      size: data.length,
      isLeaf: false,
      left:  this.buildTree(left,  depth + 1),
      right: this.buildTree(right, depth + 1),
    };
  }

  private pathLength(point: number[], node: IsolationNode, currentDepth: number): number {
    if (node.isLeaf || currentDepth >= this.config.maxDepth) {
      return currentDepth + this.cFactor(node.size);
    }

    const fi = node.featureIndex!;
    const sv = node.splitValue!;

    if (point[fi] < sv) {
      return this.pathLength(point, node.left!, currentDepth + 1);
    } else {
      return this.pathLength(point, node.right!, currentDepth + 1);
    }
  }

  /** Expected path length for a BST with n nodes */
  private cFactor(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    // Approximation: 2 * H(n-1) - (2*(n-1)/n)
    // where H(n) = harmonic number ≈ ln(n) + 0.5772
    const h = Math.log(n - 1) + 0.5772156649;
    return 2 * h - (2 * (n - 1) / n);
  }

  /** Randomly subsample n points from data */
  private subsample(data: number[][], n: number): number[][] {
    if (data.length <= n) return [...data];
    const result: number[][] = [];
    const copy = [...data];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * (copy.length - i));
      result.push(copy[idx]);
      copy[idx] = copy[copy.length - 1 - i];
    }
    return result;
  }
}
