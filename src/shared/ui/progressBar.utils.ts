/**
 * ProgressBar の割合計算（0.0 - 1.0）。
 * - total <= 0 → 0
 * - current <= 0 → 0
 * - current >= total → 1
 * - それ以外 → current / total
 *
 * React 依存を持たないため Vitest で単体テストできる。
 */
export function computeRatio(current: number, total: number): number {
	if (total <= 0) return 0;
	if (current <= 0) return 0;
	if (current >= total) return 1;
	return current / total;
}
