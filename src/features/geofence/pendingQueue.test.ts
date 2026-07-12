import { beforeEach, describe, expect, it, vi } from "vitest";

const memoryStore = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
	default: {
		getItem: async (key: string) => memoryStore.get(key) ?? null,
		setItem: async (key: string, value: string) => {
			memoryStore.set(key, value);
		},
		removeItem: async (key: string) => {
			memoryStore.delete(key);
		},
	},
}));

import {
	clearQueue,
	enqueue,
	readQueue,
	removeById,
	retryAll,
	STORAGE_KEY_PENDING_QUEUE,
} from "./pendingQueue";

const SAMPLE = {
	id: "log-1",
	workerId: "worker-1",
	geofenceId: "geo-1",
	type: "in" as const,
	timestamp: "2026-01-01T09:00:00.000Z",
	latitude: 35.6895,
	longitude: 139.6917,
};

describe("pendingQueue", () => {
	beforeEach(() => {
		memoryStore.clear();
	});

	it("空のキューは [] を返す", async () => {
		expect(await readQueue()).toEqual([]);
	});

	it("enqueue でキューにアイテムが追加される", async () => {
		await enqueue(SAMPLE);
		const queue = await readQueue();
		expect(queue).toHaveLength(1);
		expect(queue[0].id).toBe("log-1");
		expect(queue[0].attemptCount).toBe(0);
		expect(queue[0].enqueuedAt).toBeDefined();
	});

	it("removeById で指定 id が削除される", async () => {
		await enqueue(SAMPLE);
		await enqueue({ ...SAMPLE, id: "log-2" });
		await removeById("log-1");
		const queue = await readQueue();
		expect(queue).toHaveLength(1);
		expect(queue[0].id).toBe("log-2");
	});

	it("clearQueue で全削除される", async () => {
		await enqueue(SAMPLE);
		await clearQueue();
		expect(await readQueue()).toEqual([]);
	});

	it("retryAll で成功したものは削除、失敗したものは attemptCount が増える", async () => {
		await enqueue(SAMPLE);
		await enqueue({ ...SAMPLE, id: "log-2" });
		const result = await retryAll(async (e) => e.id === "log-1");
		expect(result).toEqual({ succeeded: 1, remaining: 1, discarded: 0 });
		const queue = await readQueue();
		expect(queue).toHaveLength(1);
		expect(queue[0].id).toBe("log-2");
		expect(queue[0].attemptCount).toBe(1);
	});

	it("MAX_ATTEMPTS 到達で破棄される", async () => {
		await enqueue(SAMPLE);
		// 10 回すべて失敗させる
		for (let i = 0; i < 10; i += 1) {
			await retryAll(async () => false);
		}
		const queue = await readQueue();
		expect(queue).toEqual([]);
	});

	it("JSON が壊れていても [] を返す", async () => {
		memoryStore.set(STORAGE_KEY_PENDING_QUEUE, "not-json");
		expect(await readQueue()).toEqual([]);
	});

	it("retryFn が throw しても失敗扱いになる", async () => {
		await enqueue(SAMPLE);
		const result = await retryAll(async () => {
			throw new Error("network");
		});
		expect(result.succeeded).toBe(0);
		const queue = await readQueue();
		expect(queue).toHaveLength(1);
		expect(queue[0].attemptCount).toBe(1);
	});
});
