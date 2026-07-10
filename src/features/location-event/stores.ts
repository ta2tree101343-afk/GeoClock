import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY_LAST_EVENTS } from "./services";
import type { LastEventByGeofence } from "./types";

const storage = createJSONStorage<LastEventByGeofence>(() => AsyncStorage);

export const lastEventsByGeofenceAtom = atomWithStorage<LastEventByGeofence>(
	STORAGE_KEY_LAST_EVENTS,
	{},
	storage,
);

const eventsRefetchKeyAtom = atom(0);

export const refreshLastEventsAction = atom(null, (_get, set) => {
	set(eventsRefetchKeyAtom, (n) => n + 1);
});

export { eventsRefetchKeyAtom };
