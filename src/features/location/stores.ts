import { atom } from "jotai";
import {
	getBackgroundPermissionStatus,
	getCurrentLocation,
	getForegroundPermissionStatus,
	requestBackgroundPermission,
	requestForegroundPermission,
} from "./services";
import type { Coordinate, LocationPermissionStatus } from "./types";

export const locationPermissionStatusAtom = atom<LocationPermissionStatus>(
	"undetermined",
);

export const backgroundLocationPermissionStatusAtom =
	atom<LocationPermissionStatus>("undetermined");

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
	const [fg, bg] = await Promise.all([
		getForegroundPermissionStatus(),
		getBackgroundPermissionStatus(),
	]);
	if (fg.isOk()) set(locationPermissionStatusAtom, fg.value);
	if (bg.isOk()) set(backgroundLocationPermissionStatusAtom, bg.value);
});

export const requestPermissionAction = atom(null, async (_get, set) => {
	const result = await requestForegroundPermission();
	if (result.isErr()) return;
	set(locationPermissionStatusAtom, result.value);
	set(currentLocationRefetchKeyAtom, (n) => n + 1);
});

export const requestBackgroundPermissionAction = atom(
	null,
	async (_get, set) => {
		const result = await requestBackgroundPermission();
		if (result.isErr()) return;
		set(backgroundLocationPermissionStatusAtom, result.value);
	},
);

export const refreshCurrentLocationAction = atom(null, (_get, set) => {
	set(currentLocationRefetchKeyAtom, (n) => n + 1);
});
