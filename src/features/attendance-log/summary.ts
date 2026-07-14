import type { AttendanceEntry } from "./types";

/**
 * ペア成立した勤務時間の合計を秒単位で返す。
 *
 * ロジック:
 *   1. entries を timestamp 昇順に並び替え
 *   2. geofenceId ごとにグループ化してセッションを追跡
 *   3. IN → 次の OUT (同 geofence) の差分を duration として加算
 *   4. OUT なしの IN (現在も出勤中) は集計から除外
 *   5. IN なしの OUT (データ不整合) は無視
 *
 * pure function として実装し Vitest で単体テスト可能。
 */
export function computeTotalWorkedSeconds(
	entries: AttendanceEntry[],
): number {
	const sorted = [...entries].sort(
		(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
	);

	const openIn = new Map<string, Date>();
	let totalMs = 0;

	for (const entry of sorted) {
		if (entry.type === "in") {
			// 既に IN が立っていれば置き換え（IN 連続の異常データを最新のものにリセット）
			openIn.set(entry.geofenceId, entry.timestamp);
		} else {
			// out: 対応する IN があれば duration を確定
			const inTime = openIn.get(entry.geofenceId);
			if (inTime == null) continue;
			const durationMs = entry.timestamp.getTime() - inTime.getTime();
			if (durationMs > 0) totalMs += durationMs;
			openIn.delete(entry.geofenceId);
		}
	}

	return Math.floor(totalMs / 1000);
}

/**
 * 秒数を "H時間M分" 形式に整形。
 * 例: 3665 → "1時間1分"、45 → "0時間1分"（1分未満は 0分に切り捨てず 0時間0分）
 *      0 → "0時間0分"
 */
export function formatWorkedDuration(seconds: number): string {
	if (seconds <= 0) return "0時間0分";
	const totalMinutes = Math.floor(seconds / 60);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${hours}時間${minutes}分`;
}
