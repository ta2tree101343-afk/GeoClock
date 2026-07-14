import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResultAsync } from "neverthrow";
import { client } from "../../shared/lib/amplify";
import { WorkerError, type WorkerProfile } from "./types";

/**
 * バックグラウンドタスクと UI で共有する AsyncStorage キー。
 * atom を持たない worker/services 側に置くことで、他 feature の tasks.ts が
 * worker/stores を経由せず import できる（循環依存回避）。
 */
export const STORAGE_KEY_CURRENT_WORKER_ID = "geoclock:currentWorkerId:v1";

export async function saveCurrentWorkerId(id: string): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY_CURRENT_WORKER_ID, id);
}

export async function clearCurrentWorkerId(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEY_CURRENT_WORKER_ID);
}

export async function readCurrentWorkerId(): Promise<string | null> {
	return AsyncStorage.getItem(STORAGE_KEY_CURRENT_WORKER_ID);
}

export function fetchWorker(
	id: string,
): ResultAsync<WorkerProfile | null, WorkerError> {
	return ResultAsync.fromPromise(
		client.models.Worker.get({ id }),
		(e) => new WorkerError("Worker 取得に失敗しました", { cause: e }),
	).map(({ data }) => {
		if (data == null) return null;
		return {
			id: data.id,
			email: data.email,
			name: data.name,
		};
	});
}

export function createWorker(
	profile: WorkerProfile,
): ResultAsync<WorkerProfile, WorkerError> {
	return ResultAsync.fromPromise(
		client.models.Worker.create({
			id: profile.id,
			email: profile.email,
			name: profile.name,
		}),
		(e) => new WorkerError("Worker 作成に失敗しました", { cause: e }),
	).map(() => profile);
}

/**
 * Worker が存在しなければ作成し、確実に取得する
 */
export function ensureWorker(
	profile: WorkerProfile,
): ResultAsync<WorkerProfile, WorkerError> {
	return fetchWorker(profile.id).andThen((existing) => {
		if (existing != null) return ResultAsync.fromSafePromise(Promise.resolve(existing));
		return createWorker(profile);
	});
}
