import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useTransition } from "react";
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";
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
	requestBackgroundPermissionAction,
} from "../../location/stores";
import { WorkplaceMap } from "../../location/ui/WorkplaceMap";
import {
	notificationPermissionStatusAtom,
	refreshNotificationPermissionAction,
	requestNotificationPermissionAction,
} from "../../notification/stores";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import { MonitoringControls } from "./MonitoringControls";
import { SignOutButton } from "./SignOutButton";
import { WorkplaceList } from "./WorkplaceList";

export function HomeContainer() {
	const c = useColors();
	const styles = createStyles(c);
	const auth = useAtomValue(authStateAtom);
	const statuses = useAtomValue(workplaceStatusesAtom);
	const backgroundPermission = useAtomValue(
		backgroundLocationPermissionStatusAtom,
	);
	const notificationPermission = useAtomValue(notificationPermissionStatusAtom);
	const currentLocation = useAtomValue(currentLocationAtom);
	const isGeofencingActive = useGeofencingActive();
	const workerId = auth.status === "authenticated" ? auth.user.id : undefined;
	const { start, stop } = useGeofencingControls(workerId);

	const refresh = useSetAtom(refreshWorkplaceStatusesAction);
	const refreshNotification = useSetAtom(refreshNotificationPermissionAction);
	const requestBackground = useSetAtom(requestBackgroundPermissionAction);
	const requestNotification = useSetAtom(requestNotificationPermissionAction);
	const signOut = useSetAtom(signOutAction);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		refreshNotification();
	}, [refreshNotification]);

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

	const confirmSignOut = () => {
		Alert.alert(
			"ログアウトしますか？",
			"再度利用するにはメールアドレスとパスワードでログインが必要です。",
			[
				{ text: "キャンセル", style: "cancel" },
				{
					text: "ログアウト",
					style: "destructive",
					onPress: () => signOut(),
				},
			],
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.greeting}>{displayName} さん</Text>
				<SignOutButton onPress={confirmSignOut} />
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
				<WorkplaceMap currentLocation={currentLocation} markers={markers} />
			</View>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: c.background,
		},
		header: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: c.border,
		},
		greeting: {
			fontSize: 16,
			fontWeight: "600",
			color: c.text,
		},
		list: {
			flex: 2,
		},
		map: {
			flex: 3,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: c.border,
		},
	});
