import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useTransition } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { authStateAtom, signOutAction } from "../../auth/stores";
import {
	useGeofencingActive,
	useGeofencingControls,
} from "../../geofence/hooks";
import {
	refreshWorkplaceStatusesAction,
	workplaceStatusesAtom,
} from "../../geofence/stores";
import {
	backgroundLocationPermissionStatusAtom,
	currentLocationAtom,
	locationPermissionStatusAtom,
	refreshPermissionStatusAction,
	requestBackgroundPermissionAction,
	requestPermissionAction,
} from "../../location/stores";
import { PermissionGate } from "../../location/ui/PermissionGate";
import { WorkplaceMap } from "../../location/ui/WorkplaceMap";
import {
	notificationPermissionStatusAtom,
	refreshNotificationPermissionAction,
	requestNotificationPermissionAction,
} from "../../notification/stores";
import { MonitoringControls } from "./MonitoringControls";
import { SignOutButton } from "./SignOutButton";
import { WorkplaceList } from "./WorkplaceList";

export function HomeContainer() {
	const auth = useAtomValue(authStateAtom);
	const statuses = useAtomValue(workplaceStatusesAtom);
	const permissionStatus = useAtomValue(locationPermissionStatusAtom);
	const backgroundPermission = useAtomValue(
		backgroundLocationPermissionStatusAtom,
	);
	const notificationPermission = useAtomValue(
		notificationPermissionStatusAtom,
	);
	const currentLocation = useAtomValue(currentLocationAtom);
	const isGeofencingActive = useGeofencingActive();
	const workerId = auth.status === "authenticated" ? auth.user.id : undefined;
	const { start, stop } = useGeofencingControls(workerId);

	const refresh = useSetAtom(refreshWorkplaceStatusesAction);
	const refreshPermission = useSetAtom(refreshPermissionStatusAction);
	const refreshNotification = useSetAtom(refreshNotificationPermissionAction);
	const requestPermission = useSetAtom(requestPermissionAction);
	const requestBackground = useSetAtom(requestBackgroundPermissionAction);
	const requestNotification = useSetAtom(requestNotificationPermissionAction);
	const signOut = useSetAtom(signOutAction);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		refreshPermission();
		refreshNotification();
	}, [refreshPermission, refreshNotification]);

	const displayName = auth.status === "authenticated" ? auth.user.name : "";

	const markers = statuses.map((s) => ({
		id: s.geofence.id,
		title: s.geofence.name,
		coordinate: {
			latitude: s.geofence.latitude,
			longitude: s.geofence.longitude,
		},
		radius: s.geofence.radius,
	}));

	const refreshControl = (
		<RefreshControl
			refreshing={isPending}
			onRefresh={() => startTransition(() => refresh())}
		/>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.greeting}>{displayName} さん</Text>
				<SignOutButton onPress={() => signOut()} />
			</View>
			<MonitoringControls
				isActive={isGeofencingActive}
				backgroundPermission={backgroundPermission}
				notificationPermission={notificationPermission}
				onRequestBackground={() => requestBackground()}
				onRequestNotification={() => requestNotification()}
				onStart={() => start()}
				onStop={() => stop()}
			/>
			<View style={styles.list}>
				<WorkplaceList statuses={statuses} refreshControl={refreshControl} />
			</View>
			<View style={styles.map}>
				<PermissionGate
					status={permissionStatus}
					onRequest={() => requestPermission()}
				>
					<WorkplaceMap currentLocation={currentLocation} markers={markers} />
				</PermissionGate>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ccc",
	},
	greeting: {
		fontSize: 16,
		fontWeight: "600",
	},
	list: {
		flex: 2,
	},
	map: {
		flex: 3,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "#ccc",
	},
});
