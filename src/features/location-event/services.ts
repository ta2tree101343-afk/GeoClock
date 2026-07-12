import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "../../shared/lib/amplify";
import type { LastEventByGeofence, LocationEventType } from "./types";

export const STORAGE_KEY_LAST_EVENTS = "geoclock:lastEventsByGeofence:v1";

export async function readLastEvents(): Promise<LastEventByGeofence> {
	const json = await AsyncStorage.getItem(STORAGE_KEY_LAST_EVENTS);
	if (json == null) return {};
	try {
		const parsed = JSON.parse(json);
		if (typeof parsed !== "object" || parsed == null) return {};
		return parsed as LastEventByGeofence;
	} catch {
		return {};
	}
}

export type RecordEventInput = {
	workerId: string;
	geofenceId: string;
	type: LocationEventType;
	latitude: number;
	longitude: number;
	timestamp?: Date;
};

export type RecordEventResult = {
	/** DynamoDB AttendanceLog への書き込みが成功したか */
	dbSynced: boolean;
	/** ISO タイムスタンプ */
	timestamp: string;
};

/**
 * in/out イベントを記録する。
 * - AsyncStorage に「最後のイベント」を上書き（バックグラウンドタスクから UI に共有）
 * - DynamoDB AttendanceLog に履歴を追加
 * conventions の「AsyncStorage との二重構成」パターン。
 *
 * @returns DB 書き込みの成否。呼び出し側で失敗時に pendingQueue へ積むために利用。
 */
export async function recordEvent(
	input: RecordEventInput,
): Promise<RecordEventResult> {
	const timestamp = input.timestamp ?? new Date();
	const iso = timestamp.toISOString();

	const events = await readLastEvents();
	events[input.geofenceId] = { type: input.type, timestamp: iso };
	await AsyncStorage.setItem(STORAGE_KEY_LAST_EVENTS, JSON.stringify(events));

	const dbSynced = await syncAttendanceLog({ ...input, timestamp });
	return { dbSynced, timestamp: iso };
}

/**
 * AttendanceLog を DynamoDB に書き込む。成否を boolean で返す。
 * pendingQueue の retry からも呼ばれる。
 */
export async function syncAttendanceLog(
	input: RecordEventInput & { timestamp: Date; id?: string },
): Promise<boolean> {
	try {
		const record: Parameters<typeof client.models.AttendanceLog.create>[0] = {
			workerId: input.workerId,
			geofenceId: input.geofenceId,
			type: input.type,
			timestamp: input.timestamp.toISOString(),
			latitude: input.latitude,
			longitude: input.longitude,
		};
		if (input.id != null) {
			(record as unknown as { id: string }).id = input.id;
		}
		const { errors } = await client.models.AttendanceLog.create(record);
		if (errors && errors.length > 0) {
			console.error("[location-event] AttendanceLog write errors", errors);
			return false;
		}
		return true;
	} catch (e) {
		console.error("[location-event] AttendanceLog write threw", e);
		return false;
	}
}
