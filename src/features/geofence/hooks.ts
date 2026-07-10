import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { refreshLastEventsAction } from "../location-event/stores";
import { isGeofencingActive, startGeofencing, stopGeofencing } from "./tasks";

const geofencingActiveAtom = atom(false);

export const geofencingActiveAtomReadonly = atom((get) =>
	get(geofencingActiveAtom),
);

export const setGeofencingActiveAtom = atom(
	null,
	(_get, set, value: boolean) => {
		set(geofencingActiveAtom, value);
	},
);

export function useGeofencingActive(): boolean {
	return useAtomValue(geofencingActiveAtomReadonly);
}

export function useGeofencingControls(workerId: string | undefined) {
	const setActive = useSetAtom(setGeofencingActiveAtom);
	const refreshEvents = useSetAtom(refreshLastEventsAction);

	const start = useCallback(async () => {
		if (workerId == null) return;
		await startGeofencing(workerId);
		setActive(await isGeofencingActive());
	}, [workerId, setActive]);

	const stop = useCallback(async () => {
		await stopGeofencing();
		setActive(await isGeofencingActive());
		refreshEvents();
	}, [setActive, refreshEvents]);

	return { start, stop };
}
