import { ResultAsync } from "neverthrow";
import { client } from "../../shared/lib/amplify";
import { WorkerError, type WorkerProfile } from "./types";

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
