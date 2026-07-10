export type LocationEventType = "in" | "out";

export type LocationEvent = {
	id: string;
	geofenceId: string;
	type: LocationEventType;
	timestamp: string;
};

export type LastEventByGeofence = Record<
	string,
	{ type: LocationEventType; timestamp: string } | undefined
>;
