import { createHash } from 'crypto';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function hashChain(prevHash: string, currentData: unknown): string {
  return sha256(prevHash + JSON.stringify(currentData));
}

export function diffKeys(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...allKeys].filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
}
