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

type RecordEventInput = {
	workerId: string;
	geofenceId: string;
	type: LocationEventType;
	latitude: number;
	longitude: number;
	timestamp?: Date;
};

/**
 * in/out イベントを記録する。
 * - AsyncStorage に「最後のイベント」を上書き（バックグラウンドタスクから UI に共有）
 * - DynamoDB AttendanceLog に履歴を追加
 * conventions の「AsyncStorage との二重構成」パターン。
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
	const timestamp = input.timestamp ?? new Date();
	const iso = timestamp.toISOString();

	const events = await readLastEvents();
	events[input.geofenceId] = { type: input.type, timestamp: iso };
	await AsyncStorage.setItem(STORAGE_KEY_LAST_EVENTS, JSON.stringify(events));

	try {
		await client.models.AttendanceLog.create({
			workerId: input.workerId,
			geofenceId: input.geofenceId,
			type: input.type,
			timestamp: iso,
			latitude: input.latitude,
			longitude: input.longitude,
		});
	} catch (e) {
		console.error("[location-event] AttendanceLog write failed", e);
	}
}
