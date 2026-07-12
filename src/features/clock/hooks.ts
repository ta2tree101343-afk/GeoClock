import { useAtomValue } from "jotai";
import { workplaceStatusesAtom } from "../geofence/stores";
import type { WorkplaceStatus } from "../geofence/types";
import { currentLocationAtom } from "../location/stores";
import type { Coordinate } from "../location/types";
import { haversineMeters } from "../../shared/lib/geo";

export type ClockablePlace = {
	status: WorkplaceStatus;
	distanceMeters: number;
	nextAction: "in" | "out";
};

/**
 * 現在地と勤務地一覧から、範囲内の勤務地とその次アクションを算出する。
 */
export function useClockablePlaces(): {
	currentLocation: Coordinate | null;
	insidePlaces: ClockablePlace[];
	allPlaces: WorkplaceStatus[];
} {
	const currentLocation = useAtomValue(currentLocationAtom);
	const statuses = useAtomValue(workplaceStatusesAtom);

	if (currentLocation == null) {
		return { currentLocation: null, insidePlaces: [], allPlaces: statuses };
	}

	const insidePlaces: ClockablePlace[] = [];
	for (const status of statuses) {
		const distance = haversineMeters(currentLocation, {
			latitude: status.geofence.latitude,
			longitude: status.geofence.longitude,
		});
		if (distance <= status.geofence.radius) {
			insidePlaces.push({
				status,
				distanceMeters: distance,
				nextAction: status.kind === "checkedIn" ? "out" : "in",
			});
		}
	}

	return { currentLocation, insidePlaces, allPlaces: statuses };
}
