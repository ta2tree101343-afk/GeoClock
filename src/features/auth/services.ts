import { errAsync, okAsync, type ResultAsync } from "neverthrow";
import {
	AuthError,
	type AuthUser,
	InvalidCredentialsError,
} from "./types";

/**
 * スタブ実装。将来 Amplify Auth に差し替える。
 *
 * 動作:
 *   - test@example.com + 任意のパスワード → 成功
 *   - newuser@example.com                → NEW_PASSWORD_REQUIRED
 *   - error@example.com                  → エラー
 *   - それ以外                            → InvalidCredentialsError
 */

export type SignInResult =
	| { kind: "success"; user: AuthUser }
	| { kind: "needsNewPassword"; email: string };

export function signIn(
	email: string,
	_password: string,
): ResultAsync<SignInResult, AuthError | InvalidCredentialsError> {
	if (email === "error@example.com") {
		return errAsync(new AuthError("認証サーバーでエラーが発生しました"));
	}
	if (email === "newuser@example.com") {
		return okAsync({ kind: "needsNewPassword", email });
	}
	if (email === "test@example.com") {
		return okAsync({
			kind: "success",
			user: { id: "stub-user-id", email, name: "テストユーザー" },
		});
	}
	return errAsync(
		new InvalidCredentialsError("メールアドレスまたはパスワードが正しくありません"),
	);
}

export function completeNewPassword(
	email: string,
	_newPassword: string,
): ResultAsync<AuthUser, AuthError> {
	return okAsync({ id: "stub-user-id", email, name: "テストユーザー" });
}

export function signOut(): ResultAsync<void, AuthError> {
	return okAsync(undefined);
}

export function requestPasswordReset(
	_email: string,
): ResultAsync<void, AuthError> {
	return okAsync(undefined);
}

export function confirmPasswordReset(
	_email: string,
	_code: string,
	_newPassword: string,
): ResultAsync<void, AuthError> {
	return okAsync(undefined);
}

export function restoreSession(): ResultAsync<AuthUser | null, AuthError> {
	return okAsync(null);
}
