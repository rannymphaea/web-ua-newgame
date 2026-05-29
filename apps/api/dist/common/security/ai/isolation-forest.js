"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsolationForest = void 0;
class IsolationForest {
    constructor(config) {
        this.trees = [];
        this.config = {
            numTrees: config.numTrees,
            sampleSize: config.sampleSize,
            maxDepth: config.maxDepth ?? Math.ceil(Math.log2(config.sampleSize)),
        };
    }
    fit(data) {
        if (data.length === 0)
            return;
        this.trees = [];
        for (let t = 0; t < this.config.numTrees; t++) {
            const sample = this.subsample(data, this.config.sampleSize);
            const tree = this.buildTree(sample, 0);
            this.trees.push(tree);
        }
    }
    anomalyScore(point) {
        if (this.trees.length === 0)
            return 0.5;
        const avgPathLength = this.trees.reduce((sum, tree) => {
            return sum + this.pathLength(point, tree, 0);
        }, 0) / this.trees.length;
        const c = this.cFactor(this.config.sampleSize);
        return Math.pow(2, -(avgPathLength / c));
    }
    buildTree(data, depth) {
        if (depth >= this.config.maxDepth || data.length <= 1) {
            return { size: data.length, isLeaf: true };
        }
        const numFeatures = data[0].length;
        const featureIndex = Math.floor(Math.random() * numFeatures);
        let min = Infinity, max = -Infinity;
        for (const point of data) {
            if (point[featureIndex] < min)
                min = point[featureIndex];
            if (point[featureIndex] > max)
                max = point[featureIndex];
        }
        if (min === max) {
            return { size: data.length, isLeaf: true };
        }
        const splitValue = min + Math.random() * (max - min);
        const left = data.filter(p => p[featureIndex] < splitValue);
        const right = data.filter(p => p[featureIndex] >= splitValue);
        return {
            featureIndex,
            splitValue,
            size: data.length,
            isLeaf: false,
            left: this.buildTree(left, depth + 1),
            right: this.buildTree(right, depth + 1),
        };
    }
    pathLength(point, node, currentDepth) {
        if (node.isLeaf || currentDepth >= this.config.maxDepth) {
            return currentDepth + this.cFactor(node.size);
        }
        const fi = node.featureIndex;
        const sv = node.splitValue;
        if (point[fi] < sv) {
            return this.pathLength(point, node.left, currentDepth + 1);
        }
        else {
            return this.pathLength(point, node.right, currentDepth + 1);
        }
    }
    cFactor(n) {
        if (n <= 1)
            return 0;
        if (n === 2)
            return 1;
        const h = Math.log(n - 1) + 0.5772156649;
        return 2 * h - (2 * (n - 1) / n);
    }
    subsample(data, n) {
        if (data.length <= n)
            return [...data];
        const result = [];
        const copy = [...data];
        for (let i = 0; i < n; i++) {
            const idx = Math.floor(Math.random() * (copy.length - i));
            result.push(copy[idx]);
            copy[idx] = copy[copy.length - 1 - i];
        }
        return result;
    }
}
exports.IsolationForest = IsolationForest;
//# sourceMappingURL=isolation-forest.js.map