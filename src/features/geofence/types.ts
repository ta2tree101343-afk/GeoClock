import { AppError } from "../../shared/lib/errors";

export type Geofence = {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	radius: number;
	address: string | null;
};

export type WorkplaceStatus =
	| { kind: "notCheckedIn"; geofence: Geofence }
	| { kind: "checkedIn"; geofence: Geofence; checkedInAt: Date }
	| { kind: "checkedOut"; geofence: Geofence; checkedOutAt: Date };

export class GeofenceFetchError extends AppError {
	readonly code = "GEOFENCE_FETCH_ERROR";
}
