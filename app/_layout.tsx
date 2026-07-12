import "react-native-get-random-values";
import "@aws-amplify/react-native";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
	authStateAtom,
	restoreSessionAction,
} from "../src/features/auth/stores";
import { retryPendingAttendanceLogs } from "../src/features/geofence/tasks";
import "../src/features/geofence/tasks";
import { configureAmplify } from "../src/shared/lib/amplify";
import { LoadingView } from "../src/shared/ui/LoadingView";

configureAmplify();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

function AuthGate({ children }: { children: React.ReactNode }) {
	const state = useAtomValue(authStateAtom);
	const restoreSession = useSetAtom(restoreSessionAction);
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	const lastAppStateRef = useRef<AppStateStatus>(AppState.currentState);

	useEffect(() => {
		if (state.status !== "authenticated") return;
		retryPendingAttendanceLogs().catch((e) => {
			console.error("[layout] retryPendingAttendanceLogs failed", e);
		});
	}, [state.status]);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (nextState) => {
			const prev = lastAppStateRef.current;
			lastAppStateRef.current = nextState;
			const cameToForeground =
				(prev === "background" || prev === "inactive") &&
				nextState === "active";
			if (cameToForeground && state.status === "authenticated") {
				retryPendingAttendanceLogs().catch((e) => {
					console.error("[layout] retryPendingAttendanceLogs failed", e);
				});
			}
		});
		return () => subscription.remove();
	}, [state.status]);

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
