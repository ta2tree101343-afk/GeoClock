import { ResultAsync } from "neverthrow";
import { client } from "../../shared/lib/amplify";
import { type MonthKey, monthRangeIso } from "../../shared/lib/date";
import { fetchGeofences } from "../geofence/services";
import { AttendanceLogError, type AttendanceEntry } from "./types";

const FETCH_LIMIT = 500;

export function fetchAttendanceEntriesForMonth(
	workerId: string,
	month: MonthKey,
): ResultAsync<AttendanceEntry[], AttendanceLogError> {
	return ResultAsync.fromPromise(
		fetchAttendanceEntriesRaw(workerId, month),
		(e) =>
			new AttendanceLogError("勤怠履歴の取得に失敗しました", { cause: e }),
	);
}

async function fetchAttendanceEntriesRaw(
	workerId: string,
	month: MonthKey,
): Promise<AttendanceEntry[]> {
	const { startIso, endIso } = monthRangeIso(month);
	const { data: logs, errors } =
		await client.models.AttendanceLog.listAttendanceLogByWorkerIdAndTimestamp(
			{
				workerId,
				timestamp: { between: [startIso, endIso] },
			},
			{ sortDirection: "DESC", limit: FETCH_LIMIT },
		);
	if (errors && errors.length > 0) {
		throw new Error(errors.map((e) => e.message).join(", "));
	}

	const nameByGeofenceId = await loadGeofenceNames(workerId);

	return logs
		.map((log): AttendanceEntry | null => {
			if (log.type !== "in" && log.type !== "out") return null;
			return {
				id: log.id,
				geofenceId: log.geofenceId,
				geofenceName: nameByGeofenceId.get(log.geofenceId) ?? log.geofenceId,
				type: log.type,
				timestamp: new Date(log.timestamp),
				latitude: log.latitude,
				longitude: log.longitude,
			};
		})
		.filter((e): e is AttendanceEntry => e != null);
}

async function loadGeofenceNames(
	workerId: string,
): Promise<Map<string, string>> {
	const result = await fetchGeofences(workerId);
	if (result.isErr()) return new Map();
	const map = new Map<string, string>();
	for (const g of result.value) map.set(g.id, g.name);
	return map;
}
