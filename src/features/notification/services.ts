import * as Notifications from "expo-notifications";
import { ResultAsync } from "neverthrow";
import { NotificationError, type NotificationPermissionStatus } from "./types";

function toStatus(
	status: Notifications.PermissionStatus,
): NotificationPermissionStatus {
	switch (status) {
		case Notifications.PermissionStatus.GRANTED:
			return "granted";
		case Notifications.PermissionStatus.DENIED:
			return "denied";
		case Notifications.PermissionStatus.UNDETERMINED:
			return "undetermined";
		default: {
			const _exhaustiveCheck: never = status;
			return _exhaustiveCheck;
		}
	}
}

export function getNotificationPermissionStatus(): ResultAsync<
	NotificationPermissionStatus,
	NotificationError
> {
	return ResultAsync.fromPromise(
		Notifications.getPermissionsAsync(),
		(e) =>
			new NotificationError("通知パーミッション取得に失敗しました", {
				cause: e,
			}),
	).map(({ status }) => toStatus(status));
}

export function requestNotificationPermission(): ResultAsync<
	NotificationPermissionStatus,
	NotificationError
> {
	return ResultAsync.fromPromise(
		Notifications.requestPermissionsAsync(),
		(e) =>
			new NotificationError("通知パーミッション要求に失敗しました", {
				cause: e,
			}),
	).map(({ status }) => toStatus(status));
}

export function sendLocalNotification(
	title: string,
	body: string,
): ResultAsync<void, NotificationError> {
	return ResultAsync.fromPromise(
		Notifications.scheduleNotificationAsync({
			content: { title, body },
			trigger: null,
		}),
		(e) => new NotificationError("通知送信に失敗しました", { cause: e }),
	).map(() => undefined);
}
