export type MonthKey = {
	year: number;
	// 1-12（人間可読）
	month: number;
};

/**
 * ある月の [開始, 次月開始) の ISO 範囲を返す。
 * 例: {year:2026, month:7} → ["2026-07-01T00:00:00.000Z", "2026-08-01T00:00:00.000Z")
 * タイムゾーンは端末ローカル (Date コンストラクタ) に依存。
 */
export function monthRangeIso(key: MonthKey): {
	startIso: string;
	endIso: string;
} {
	const start = new Date(key.year, key.month - 1, 1, 0, 0, 0, 0);
	const end = new Date(key.year, key.month, 1, 0, 0, 0, 0);
	return { startIso: start.toISOString(), endIso: end.toISOString() };
}

/**
 * 現在のローカル月を MonthKey で返す。
 */
export function currentMonthKey(now: Date = new Date()): MonthKey {
	return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * MonthKey に対して n ヶ月加算した MonthKey を返す（負数で減算）。
 */
export function addMonths(key: MonthKey, n: number): MonthKey {
	const zeroBased = key.month - 1 + n;
	const year = key.year + Math.floor(zeroBased / 12);
	const month = ((zeroBased % 12) + 12) % 12 + 1;
	return { year, month };
}

/**
 * "2026年7月" のような表示用ラベル。
 */
export function formatMonthLabel(key: MonthKey): string {
	return `${key.year}年${key.month}月`;
}

/**
 * 2 つの MonthKey が同じかを判定。
 */
export function isSameMonth(a: MonthKey, b: MonthKey): boolean {
	return a.year === b.year && a.month === b.month;
}
