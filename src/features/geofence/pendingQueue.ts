import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationEventType } from "../location-event/types";

export const STORAGE_KEY_PENDING_QUEUE = "geoclock:pendingAttendanceQueue:v1";

export type PendingAttendanceEvent = {
	id: string;
	workerId: string;
	geofenceId: string;
	type: LocationEventType;
	timestamp: string;
	latitude: number;
	longitude: number;
	enqueuedAt: string;
	attemptCount: number;
};

/**
 * DynamoDB 書き込みに失敗した AttendanceLog を AsyncStorage にキューイングし、
 * 後で再送する仕組み。バックグラウンドタスクからも UI からも使える。
 *
 * conventions の「AsyncStorage との二重構成」に準拠。
 */

const MAX_QUEUE_SIZE = 200;
const MAX_ATTEMPTS = 10;

export async function readQueue(): Promise<PendingAttendanceEvent[]> {
	const json = await AsyncStorage.getItem(STORAGE_KEY_PENDING_QUEUE);
	if (json == null) return [];
	try {
		const parsed = JSON.parse(json);
		if (!Array.isArray(parsed)) return [];
		return parsed as PendingAttendanceEvent[];
	} catch {
		return [];
	}
}

async function writeQueue(queue: PendingAttendanceEvent[]): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY_PENDING_QUEUE, JSON.stringify(queue));
}

export async function enqueue(
	event: Omit<PendingAttendanceEvent, "enqueuedAt" | "attemptCount">,
): Promise<void> {
	const queue = await readQueue();
	const item: PendingAttendanceEvent = {
		...event,
		enqueuedAt: new Date().toISOString(),
		attemptCount: 0,
	};
	const next = [...queue, item].slice(-MAX_QUEUE_SIZE);
	await writeQueue(next);
}

export async function removeById(id: string): Promise<void> {
	const queue = await readQueue();
	await writeQueue(queue.filter((e) => e.id !== id));
}

export async function clearQueue(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEY_PENDING_QUEUE);
}

/**
 * キュー内の全アイテムを retryFn で順次再送。
 * - 成功したものはキューから削除
 * - 失敗したものは attemptCount を +1 し、MAX_ATTEMPTS 超えたら破棄
 */
export async function retryAll(
	retryFn: (event: PendingAttendanceEvent) => Promise<boolean>,
): Promise<{ succeeded: number; remaining: number; discarded: number }> {
	const queue = await readQueue();
	let succeeded = 0;
	let discarded = 0;
	const nextQueue: PendingAttendanceEvent[] = [];

	for (const event of queue) {
		const ok = await retryFn(event).catch(() => false);
		if (ok) {
			succeeded += 1;
			continue;
		}
		const attemptCount = event.attemptCount + 1;
		if (attemptCount >= MAX_ATTEMPTS) {
			discarded += 1;
			continue;
		}
		nextQueue.push({ ...event, attemptCount });
	}

	await writeQueue(nextQueue);
	return { succeeded, remaining: nextQueue.length, discarded };
}
