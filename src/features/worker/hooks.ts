import { atom, useAtomValue, useSetAtom } from "jotai";
import { unwrap } from "jotai/utils";
import {
	geofencesAtom,
	refreshWorkplaceStatusesAction,
} from "../geofence/stores";
import type { Geofence } from "../geofence/types";
import { currentWorkerAtom } from "./stores";

type Loadable<T> =
	| { state: "loading" }
	| { state: "hasData"; data: T }
	| { state: "hasError"; error: unknown };

function toLoadable<T>(base: {
	get: () => Promise<T> | T | undefined;
}): Loadable<T> {
	try {
		const value = base.get();
		if (value === undefined) return { state: "loading" };
		if (value instanceof Promise) return { state: "loading" };
		return { state: "hasData", data: value };
	} catch (error) {
		return { state: "hasError", error };
	}
}

const currentWorkerUnwrapAtom = unwrap(currentWorkerAtom);
const geofencesUnwrapAtom = unwrap(geofencesAtom);

const workerLoadableAtom = atom((get): Loadable<unknown> =>
	toLoadable({ get: () => get(currentWorkerUnwrapAtom) }),
);
const geofencesLoadableAtom = atom((get): Loadable<Geofence[]> =>
	toLoadable({ get: () => get(geofencesUnwrapAtom) }),
);

type WorkerInitializationState = {
	geofences: Geofence[];
	isLoading: boolean;
	error: string | null;
	retry: () => void;
};

const retryAtom = atom(null, (_get, set) => {
	set(refreshWorkplaceStatusesAction);
});

export function useWorkerInitialization(): WorkerInitializationState {
	const workerLoadable = useAtomValue(workerLoadableAtom);
	const geofencesLoadable = useAtomValue(geofencesLoadableAtom);
	const triggerRetry = useSetAtom(retryAtom);

	const isLoading =
		workerLoadable.state === "loading" ||
		geofencesLoadable.state === "loading";

	const error =
		workerLoadable.state === "hasError"
			? errorMessage(workerLoadable.error)
			: geofencesLoadable.state === "hasError"
				? errorMessage(geofencesLoadable.error)
				: null;

	const geofences =
		geofencesLoadable.state === "hasData" ? geofencesLoadable.data : [];

	const retry = () => {
		triggerRetry();
	};

	return { geofences, isLoading, error, retry };
}

function errorMessage(e: unknown): string {
	if (e instanceof Error) return e.message;
	return "エラーが発生しました";
}
