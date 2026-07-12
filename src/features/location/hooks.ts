import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	locationPermissionStatusAtom,
	refreshPermissionStatusAction,
} from "./stores";
import type { LocationPermissionStatus } from "./types";

type LocationPermissionState = {
	status: LocationPermissionStatus;
	refresh: () => Promise<void>;
};

export function useLocationPermission(): LocationPermissionState {
	const status = useAtomValue(locationPermissionStatusAtom);
	const refreshAction = useSetAtom(refreshPermissionStatusAction);

	useEffect(() => {
		refreshAction();
	}, [refreshAction]);

	const refresh = async () => {
		await refreshAction();
	};

	return { status, refresh };
}
