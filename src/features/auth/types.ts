import { AppError } from "../../shared/lib/errors";

export type AuthUser = {
	id: string;
	email: string;
	name: string;
};

export type AuthState =
	| { status: "checking" }
	| { status: "unauthenticated" }
	| { status: "authenticating" }
	| { status: "needsNewPassword"; email: string }
	| { status: "authenticated"; user: AuthUser }
	| { status: "error"; error: AuthError };

export class AuthError extends AppError {
	readonly code = "AUTH_ERROR";
}

export class InvalidCredentialsError extends AppError {
	readonly code = "INVALID_CREDENTIALS";
}
