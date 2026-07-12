import { atom } from "jotai";
import { currentWorkerAtom } from "../worker/stores";
import { fetchAttendanceEntries } from "./services";
import type {
	AttendanceDayGroup,
	AttendanceEntry,
} from "./types";

const attendanceRefetchKeyAtom = atom(0);

export const attendanceEntriesAtom = atom(
	async (get): Promise<AttendanceEntry[]> => {
		get(attendanceRefetchKeyAtom);
		const worker = await get(currentWorkerAtom);
		if (worker == null) return [];

		const result = await fetchAttendanceEntries(worker.id);
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
