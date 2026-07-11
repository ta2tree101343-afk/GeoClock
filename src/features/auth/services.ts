import {
	confirmResetPassword as amplifyConfirmResetPassword,
	confirmSignIn as amplifyConfirmSignIn,
	resetPassword as amplifyResetPassword,
	signIn as amplifySignIn,
	signOut as amplifySignOut,
	fetchUserAttributes,
	getCurrentUser,
} from "aws-amplify/auth";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { AuthError, type AuthUser, InvalidCredentialsError } from "./types";

export type SignInResult =
	| { kind: "success"; user: AuthUser }
	| { kind: "needsNewPassword"; email: string };

function toSignInError(e: unknown): AuthError | InvalidCredentialsError {
	if (e instanceof Error) {
		switch (e.name) {
			case "NotAuthorizedException":
			case "UserNotFoundException":
				return new InvalidCredentialsError(
					"メールアドレスまたはパスワードが正しくありません",
					{ cause: e },
				);
			default:
				return new AuthError(e.message, { cause: e });
		}
	}
	return new AuthError("認証中に予期しないエラーが発生しました");
}

function toAuthError(e: unknown): AuthError {
	if (e instanceof Error) {
		return new AuthError(e.message, { cause: e });
	}
	return new AuthError("認証中に予期しないエラーが発生しました");
}

async function loadAuthUser(): Promise<AuthUser> {
	const current = await getCurrentUser();
	const attrs = await fetchUserAttributes();
	return {
		id: current.userId,
		email: attrs.email ?? current.signInDetails?.loginId ?? "",
		name: attrs.given_name ?? "",
	};
}

export function signIn(
	email: string,
	password: string,
): ResultAsync<SignInResult, AuthError | InvalidCredentialsError> {
	return ResultAsync.fromPromise(
		amplifySignIn({ username: email, password }),
		toSignInError,
	).andThen((output) => {
		if (
			output.nextStep.signInStep ===
			"CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
		) {
			return okAsync<SignInResult, AuthError>({
				kind: "needsNewPassword",
				email,
			});
		}
		if (output.isSignedIn) {
			return ResultAsync.fromPromise(loadAuthUser(), toAuthError).map(
				(user): SignInResult => ({ kind: "success", user }),
			);
		}
		return errAsync(
			new AuthError(`未対応の認証ステップ: ${output.nextStep.signInStep}`),
		);
	});
}

export function completeNewPassword(
	_email: string,
	newPassword: string,
): ResultAsync<AuthUser, AuthError> {
	return ResultAsync.fromPromise(
		amplifyConfirmSignIn({ challengeResponse: newPassword }),
		toAuthError,
	).andThen((output) => {
		if (!output.isSignedIn) {
			return errAsync(
				new AuthError(
					`パスワード変更後の認証ステップが未対応: ${output.nextStep.signInStep}`,
				),
			);
		}
		return ResultAsync.fromPromise(loadAuthUser(), toAuthError);
	});
}

export function signOut(): ResultAsync<void, AuthError> {
	return ResultAsync.fromPromise(amplifySignOut(), toAuthError).map(
		() => undefined,
	);
}

export function requestPasswordReset(
	email: string,
): ResultAsync<void, AuthError> {
	return ResultAsync.fromPromise(
		amplifyResetPassword({ username: email }),
		toAuthError,
	).map(() => undefined);
}

export function confirmPasswordReset(
	email: string,
	code: string,
	newPassword: string,
): ResultAsync<void, AuthError> {
	return ResultAsync.fromPromise(
		amplifyConfirmResetPassword({
			username: email,
			confirmationCode: code,
			newPassword,
		}),
		toAuthError,
	).map(() => undefined);
}

export function restoreSession(): ResultAsync<AuthUser | null, AuthError> {
	return ResultAsync.fromPromise(loadAuthUser(), (e) => e).orElse(() =>
		okAsync<AuthUser | null, AuthError>(null),
	);
}
