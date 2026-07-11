import { atom } from "jotai";
import { lastEventsByGeofenceAtom } from "../location-event/stores";
import { currentWorkerAtom } from "../worker/stores";
import { fetchGeofences } from "./services";
import type { Geofence, WorkplaceStatus } from "./types";

const geofencesRefetchKeyAtom = atom(0);

export const geofencesAtom = atom(async (get): Promise<Geofence[]> => {
	get(geofencesRefetchKeyAtom);
	const worker = await get(currentWorkerAtom);
	if (worker == null) return [];

	const result = await fetchGeofences(worker.id);
	if (result.isErr()) throw result.error;
	return result.value;
});

export const workplaceStatusesAtom = atom(
	async (get): Promise<WorkplaceStatus[]> => {
		const geofences = await get(geofencesAtom);
		const lastEvents = await get(lastEventsByGeofenceAtom);

		return geofences.map((geofence): WorkplaceStatus => {
			const last = lastEvents[geofence.id];
			if (last == null) return { kind: "notCheckedIn", geofence };
			if (last.type === "in") {
				return {
					kind: "checkedIn",
					geofence,
					checkedInAt: new Date(last.timestamp),
				};
			}
			return {
				kind: "checkedOut",
				geofence,
				checkedOutAt: new Date(last.timestamp),
			};
		});
	},
);

export const refreshWorkplaceStatusesAction = atom(null, (_get, set) => {
	set(geofencesRefetchKeyAtom, (n) => n + 1);
});
