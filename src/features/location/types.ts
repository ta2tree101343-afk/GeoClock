import { AppError } from "../../shared/lib/errors";

export type LocationPermissionStatus = "granted" | "denied" | "undetermined";

export type Coordinate = {
	latitude: number;
	longitude: number;
};

export class LocationError extends AppError {
	readonly code = "LOCATION_ERROR";
}
