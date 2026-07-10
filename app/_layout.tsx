import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { authStateAtom, restoreSessionAction } from "../src/features/auth/stores";
import { LoadingView } from "../src/shared/ui/LoadingView";

function AuthGate({ children }: { children: React.ReactNode }) {
	const state = useAtomValue(authStateAtom);
	const restoreSession = useSetAtom(restoreSessionAction);
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	useEffect(() => {
		if (state.status === "checking") return;

		const inAuthGroup = segments[0] === "(auth)";

		if (state.status === "authenticated" && inAuthGroup) {
			router.replace("/(tabs)");
			return;
		}
		if (state.status === "needsNewPassword") {
			router.replace("/(auth)/new-password");
			return;
		}
		if (
			(state.status === "unauthenticated" ||
				state.status === "authenticating" ||
				state.status === "error") &&
			!inAuthGroup
		) {
			router.replace("/(auth)/login");
		}
	}, [state.status, segments, router]);

	if (state.status === "checking") {
		return <LoadingView />;
	}

	return <>{children}</>;
}

export default function RootLayout() {
	return (
		<Provider>
			<AuthGate>
				<Stack>
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="checklist" options={{ headerShown: false }} />
				</Stack>
			</AuthGate>
		</Provider>
	);
}
