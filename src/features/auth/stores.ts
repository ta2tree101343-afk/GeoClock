import { atom } from "jotai";
import { stopGeofencing } from "../geofence/tasks";
import { clearCurrentWorkerId } from "../worker/services";
import { authLogger } from "../../shared/lib/logger";
import {
	completeNewPassword,
	restoreSession,
	signIn,
	signOut,
} from "./services";
import { type AuthState, AuthError } from "./types";

export const authStateAtom = atom<AuthState>({ status: "checking" });

export const restoreSessionAction = atom(null, async (_get, set) => {
	const result = await restoreSession();
	if (result.isErr()) {
		set(authStateAtom, { status: "error", error: result.error });
		return;
	}
	if (result.value == null) {
		set(authStateAtom, { status: "unauthenticated" });
		return;
	}
	set(authStateAtom, { status: "authenticated", user: result.value });
});

export const signInAction = atom(
	null,
	async (
		_get,
		set,
		{ email, password }: { email: string; password: string },
	) => {
		set(authStateAtom, { status: "authenticating" });
		const result = await signIn(email, password);
		if (result.isErr()) {
			set(authStateAtom, {
				status: "error",
				error:
					result.error instanceof AuthError
						? result.error
						: new AuthError(result.error.message, { cause: result.error }),
			});
			return;
		}
		if (result.value.kind === "needsNewPassword") {
			set(authStateAtom, {
				status: "needsNewPassword",
				email: result.value.email,
			});
			return;
		}
		set(authStateAtom, { status: "authenticated", user: result.value.user });
	},
);

export const completeNewPasswordAction = atom(
	null,
	async (
		_get,
		set,
		{ email, newPassword }: { email: string; newPassword: string },
	) => {
		set(authStateAtom, { status: "authenticating" });
		const result = await completeNewPassword(email, newPassword);
		if (result.isErr()) {
			set(authStateAtom, { status: "error", error: result.error });
			return;
		}
		set(authStateAtom, { status: "authenticated", user: result.value });
	},
);

export const signOutAction = atom(null, async (_get, set) => {
	// Cognito サインアウトが失敗しても、端末側のバックグラウンド状態は
	// 常にクリアする（旧ユーザーのジオフェンス監視が残り続けないように）
	await stopGeofencing().catch((e) => {
		authLogger.warn("stopGeofencing on sign-out failed", e);
	});
	await clearCurrentWorkerId().catch((e) => {
		authLogger.warn("clearCurrentWorkerId on sign-out failed", e);
	});

	const result = await signOut();
	if (result.isErr()) {
		set(authStateAtom, { status: "error", error: result.error });
		return;
	}
	set(authStateAtom, { status: "unauthenticated" });
});

export const resetAuthErrorAction = atom(null, (_get, set) => {
	set(authStateAtom, { status: "unauthenticated" });
});
