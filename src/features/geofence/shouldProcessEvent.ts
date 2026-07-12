import type { LocationEventType } from "../location-event/types";

type LastEvent = {
	type: LocationEventType;
	timestamp: string;
};

/**
 * in/out 頻発の抑制ロジック
 *
 * ルール:
 *   - 直前のイベントと同じ type かつ最小滞在時間内なら false (無視)
 *   - 直前が in で今回が out（またはその逆）でも最小間隔内なら false (無視)
 *   - それ以外は true (処理する)
 *
 * @param last この勤務地の直前のイベント（無ければ null）
 * @param next 今回検知したイベント
 * @param options.minSameEventIntervalMs 同 type 連続の最小間隔（デフォルト 5 分）
 * @param options.minToggleIntervalMs in↔out 切り替えの最小間隔（デフォルト 30 秒）
 */
export function shouldProcessEvent(
	last: LastEvent | null,
	next: { type: LocationEventType; timestamp: Date },
	options: {
		minSameEventIntervalMs?: number;
		minToggleIntervalMs?: number;
	} = {},
): boolean {
	if (last == null) return true;

	const minSame = options.minSameEventIntervalMs ?? 5 * 60 * 1000;
	const minToggle = options.minToggleIntervalMs ?? 30 * 1000;

	const lastMs = new Date(last.timestamp).getTime();
	const nextMs = next.timestamp.getTime();
	const diff = nextMs - lastMs;

	if (diff < 0) return false;

	if (last.type === next.type) {
		return diff >= minSame;
	}

	return diff >= minToggle;
}
