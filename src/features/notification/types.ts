import { AppError } from "../../shared/lib/errors";

export type NotificationPermissionStatus =
	| "granted"
	| "denied"
	| "undetermined";

export class NotificationError extends AppError {
	readonly code = "NOTIFICATION_ERROR";
}
