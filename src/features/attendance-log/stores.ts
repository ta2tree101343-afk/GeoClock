import { atom } from "jotai";
import { addMonths, currentMonthKey, type MonthKey } from "../../shared/lib/date";
import { currentWorkerAtom } from "../worker/stores";
import { fetchAttendanceEntriesForMonth } from "./services";
import type { AttendanceDayGroup, AttendanceEntry } from "./types";

// 現在選択中の月 (デフォルト: 今月)
export const selectedMonthAtom = atom<MonthKey>(currentMonthKey());

// 月選択のリフェッチキー (手動リフレッシュで再フェッチ)
const attendanceRefetchKeyAtom = atom(0);

export const attendanceEntriesAtom = atom(
	async (get): Promise<AttendanceEntry[]> => {
		get(attendanceRefetchKeyAtom);
		const worker = await get(currentWorkerAtom);
		if (worker == null) return [];

		const month = get(selectedMonthAtom);
		const result = await fetchAttendanceEntriesForMonth(worker.id, month);
		if (result.isErr()) throw result.error;
		return result.value;
	},
);

export const attendanceDayGroupsAtom = atom(
	async (get): Promise<AttendanceDayGroup[]> => {
		const entries = await get(attendanceEntriesAtom);
		return groupByDate(entries);
	},
);

export const refreshAttendanceLogAction = atom(null, (_get, set) => {
	set(attendanceRefetchKeyAtom, (n) => n + 1);
});

// 前月へ移動
export const previousMonthAction = atom(null, (get, set) => {
	set(selectedMonthAtom, addMonths(get(selectedMonthAtom), -1));
});

// 翌月へ移動
export const nextMonthAction = atom(null, (get, set) => {
	set(selectedMonthAtom, addMonths(get(selectedMonthAtom), 1));
});

// 今月へリセット
export const resetToCurrentMonthAction = atom(null, (_get, set) => {
	set(selectedMonthAtom, currentMonthKey());
});

function groupByDate(entries: AttendanceEntry[]): AttendanceDayGroup[] {
	const groups = new Map<string, AttendanceEntry[]>();
	for (const entry of entries) {
		const key = toDateKey(entry.timestamp);
		const bucket = groups.get(key);
		if (bucket == null) {
			groups.set(key, [entry]);
		} else {
			bucket.push(entry);
		}
	}
	return Array.from(groups.entries()).map(([dateKey, list]) => ({
		dateKey,
		label: formatDateLabel(list[0].timestamp),
		entries: list,
	}));
}

function toDateKey(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

function formatDateLabel(date: Date): string {
	const now = new Date();
	const isSameDay = (a: Date, b: Date) =>
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate();

	if (isSameDay(date, now)) return "今日";
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (isSameDay(date, yesterday)) return "昨日";

	const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
	const mm = date.getMonth() + 1;
	const dd = date.getDate();
	const dow = dayLabels[date.getDay()];
	return `${mm}月${dd}日 (${dow})`;
}
