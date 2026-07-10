import { atom } from "jotai";
import {
	getCurrentLocation,
	getForegroundPermissionStatus,
	requestForegroundPermission,
} from "./services";
import type { Coordinate, LocationPermissionStatus } from "./types";

export const locationPermissionStatusAtom = atom<LocationPermissionStatus>(
	"undetermined",
);

const currentLocationRefetchKeyAtom = atom(0);

export const currentLocationAtom = atom(
	async (get): Promise<Coordinate | null> => {
		get(currentLocationRefetchKeyAtom);
		if (get(locationPermissionStatusAtom) !== "granted") return null;

		const result = await getCurrentLocation();
		if (result.isErr()) throw result.error;
		return result.value;
	},
);

export const refreshPermissionStatusAction = atom(null, async (_get, set) => {
	const result = await getForegroundPermissionStatus();
	if (result.isErr()) return;
	set(locationPermissionStatusAtom, result.value);
});

export const requestPermissionAction = atom(null, async (_get, set) => {
	const result = await requestForegroundPermission();
	if (result.isErr()) return;
	set(locationPermissionStatusAtom, result.value);
	set(currentLocationRefetchKeyAtom, (n) => n + 1);
});

export const refreshCurrentLocationAction = atom(null, (_get, set) => {
	set(currentLocationRefetchKeyAtom, (n) => n + 1);
});
