import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { readLastEvents, STORAGE_KEY_LAST_EVENTS } from "./services";
import type { LastEventByGeofence } from "./types";

const storage = createJSONStorage<LastEventByGeofence>(() => AsyncStorage);

export const lastEventsByGeofenceAtom = atomWithStorage<LastEventByGeofence>(
	STORAGE_KEY_LAST_EVENTS,
	{},
	storage,
);

/**
 * AsyncStorage から最新の lastEvents を読み直して atom に反映する。
 * バックグラウンドタスクや手動打刻が AsyncStorage を直接更新するため、
 * UI 側から明示的に再読込を発火する必要がある。
 */
export const refreshLastEventsAction = atom(null, async (_get, set) => {
	const events = await readLastEvents();
	set(lastEventsByGeofenceAtom, events);
});
