import AsyncStorage from "@react-native-async-storage/async-storage";
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

export async function recordEvent(
	geofenceId: string,
	type: LocationEventType,
	timestamp: Date = new Date(),
): Promise<void> {
	const events = await readLastEvents();
	events[geofenceId] = { type, timestamp: timestamp.toISOString() };
	await AsyncStorage.setItem(STORAGE_KEY_LAST_EVENTS, JSON.stringify(events));
}
