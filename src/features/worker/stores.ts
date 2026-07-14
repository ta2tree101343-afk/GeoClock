import { atom } from "jotai";
import { authStateAtom } from "../auth/stores";
import { ensureWorker, saveCurrentWorkerId } from "./services";
import type { WorkerProfile } from "./types";

// Re-export for backward compatibility (previously exported from stores)
export { STORAGE_KEY_CURRENT_WORKER_ID } from "./services";

/**
 * ログイン中の Worker を、なければ作成しつつ返す
 * バックグラウンドタスクからも参照できるよう workerId を AsyncStorage に保存する
 */
export const currentWorkerAtom = atom(
	async (get): Promise<WorkerProfile | null> => {
		const auth = get(authStateAtom);
		if (auth.status !== "authenticated") return null;

		const result = await ensureWorker({
			id: auth.user.id,
			email: auth.user.email,
			name: auth.user.name,
		});
		if (result.isErr()) throw result.error;

		await saveCurrentWorkerId(result.value.id);
		return result.value;
	},
);
