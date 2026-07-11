import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { recordEvent } from "../location-event/services";
import { sendLocalNotification } from "../notification/services";
import { STORAGE_KEY_CURRENT_WORKER_ID } from "../worker/stores";
import { fetchGeofences } from "./services";

export const GEOFENCE_TASK_NAME = "geoclock-geofence-task";

type GeofenceTaskData = {
	eventType: Location.GeofencingEventType;
	region: {
		identifier: string;
		state: Location.GeofencingRegionState;
		latitude: number;
		longitude: number;
		radius: number;
	};
};

async function readCurrentWorkerId(): Promise<string | null> {
	return AsyncStorage.getItem(STORAGE_KEY_CURRENT_WORKER_ID);
}

async function resolveGeofenceName(
	identifier: string,
	workerId: string,
): Promise<string> {
	const result = await fetchGeofences(workerId);
	if (result.isErr()) return identifier;
	return result.value.find((g) => g.id === identifier)?.name ?? identifier;
}

TaskManager.defineTask<GeofenceTaskData>(
	GEOFENCE_TASK_NAME,
	async ({ data, error }) => {
		if (error) {
			console.error("[geofence-task]", error);
			return;
		}
		if (!data) return;

		const { eventType, region } = data;
		const type =
			eventType === Location.GeofencingEventType.Enter ? "in" : "out";

		const workerId = await readCurrentWorkerId();
		if (workerId == null) {
			console.warn(
				"[geofence-task] currentWorkerId is missing; skip recording",
			);
			return;
		}

		await recordEvent({
			workerId,
			geofenceId: region.identifier,
			type,
			latitude: region.latitude,
			longitude: region.longitude,
		});

		const label = type === "in" ? "出勤" : "退勤";
		const name = await resolveGeofenceName(region.identifier, workerId);
		await sendLocalNotification(`${label}しました`, `勤務地: ${name}`);
	},
);

export async function startGeofencing(workerId: string): Promise<void> {
	const isRegistered =
		await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
	if (isRegistered) {
		await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME).catch(() => {});
	}

	const result = await fetchGeofences(workerId);
	if (result.isErr()) throw result.error;

	const regions = result.value.map((g) => ({
		identifier: g.id,
		latitude: g.latitude,
		longitude: g.longitude,
		radius: g.radius,
		notifyOnEnter: true,
		notifyOnExit: true,
	}));

	if (regions.length === 0) return;
	await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
}

export async function stopGeofencing(): Promise<void> {
	const isRegistered =
		await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
	if (!isRegistered) return;
	await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME).catch(() => {});
}

export async function isGeofencingActive(): Promise<boolean> {
	return TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
}
