import { atom } from "jotai";
import {
	getNotificationPermissionStatus,
	requestNotificationPermission,
} from "./services";
import type { NotificationPermissionStatus } from "./types";

export const notificationPermissionStatusAtom =
	atom<NotificationPermissionStatus>("undetermined");

export const refreshNotificationPermissionAction = atom(
	null,
	async (_get, set) => {
		const result = await getNotificationPermissionStatus();
		if (result.isErr()) return;
		set(notificationPermissionStatusAtom, result.value);
	},
);

export const requestNotificationPermissionAction = atom(
	null,
	async (_get, set) => {
		const result = await requestNotificationPermission();
		if (result.isErr()) return;
		set(notificationPermissionStatusAtom, result.value);
	},
);
