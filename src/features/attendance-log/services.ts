import { ResultAsync } from "neverthrow";
import { client } from "../../shared/lib/amplify";
import { fetchGeofences } from "../geofence/services";
import { AttendanceLogError, type AttendanceEntry } from "./types";

const FETCH_LIMIT = 100;

export function fetchAttendanceEntries(
	workerId: string,
): ResultAsync<AttendanceEntry[], AttendanceLogError> {
	return ResultAsync.fromPromise(
		fetchAttendanceEntriesRaw(workerId),
		(e) =>
			new AttendanceLogError("勤怠履歴の取得に失敗しました", { cause: e }),
	);
}

async function fetchAttendanceEntriesRaw(
	workerId: string,
): Promise<AttendanceEntry[]> {
	const { data: logs, errors } =
		await client.models.AttendanceLog.listAttendanceLogByWorkerIdAndTimestamp(
			{ workerId },
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
