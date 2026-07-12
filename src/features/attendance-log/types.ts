import { AppError } from "../../shared/lib/errors";

export type AttendanceEntry = {
	id: string;
	geofenceId: string;
	geofenceName: string;
	type: "in" | "out";
	timestamp: Date;
	latitude: number;
	longitude: number;
};

export type AttendanceDayGroup = {
	dateKey: string;
	label: string;
	entries: AttendanceEntry[];
};

export class AttendanceLogError extends AppError {
	readonly code = "ATTENDANCE_LOG_ERROR";
}
