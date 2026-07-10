import { atom } from "jotai";
import { authStateAtom } from "../auth/stores";
import { fetchWorkplaceStatuses } from "./services";
import type { WorkplaceStatus } from "./types";

const workplaceStatusesRefetchKeyAtom = atom(0);

export const workplaceStatusesAtom = atom(
	async (get): Promise<WorkplaceStatus[]> => {
		get(workplaceStatusesRefetchKeyAtom);
		const auth = get(authStateAtom);
		if (auth.status !== "authenticated") return [];

		const result = await fetchWorkplaceStatuses(auth.user.id);
		if (result.isErr()) throw result.error;
		return result.value;
	},
);

export const refreshWorkplaceStatusesAction = atom(null, (_get, set) => {
	set(workplaceStatusesRefetchKeyAtom, (n) => n + 1);
});
