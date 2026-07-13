import { useAtomValue, useSetAtom } from "jotai";
import { useState, useTransition } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authStateAtom } from "../../auth/stores";
import { refreshWorkplaceStatusesAction } from "../../geofence/stores";
import { refreshCurrentLocationAction } from "../../location/stores";
import { refreshLastEventsAction } from "../../location-event/stores";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import { useClockablePlaces } from "../hooks";
import { manualPunch } from "../services";
import { PlaceCard } from "./PlaceCard";

export function ClockContainer() {
	const c = useColors();
	const styles = createStyles(c);
	const insets = useSafeAreaInsets();
	const { currentLocation, insidePlaces, allPlaces } = useClockablePlaces();
	const auth = useAtomValue(authStateAtom);
	const refreshLocation = useSetAtom(refreshCurrentLocationAction);
	const refreshGeofences = useSetAtom(refreshWorkplaceStatusesAction);
	const refreshEvents = useSetAtom(refreshLastEventsAction);
	const [isPending, startTransition] = useTransition();
	const [busyGeofenceId, setBusyGeofenceId] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const onRefresh = () => {
		setMessage(null);
		startTransition(() => {
			refreshLocation();
			refreshGeofences();
		});
	};

	const onPunch = async (
		geofenceId: string,
		type: "in" | "out",
		latitude: number,
		longitude: number,
	) => {
		if (auth.status !== "authenticated") return;
		setBusyGeofenceId(geofenceId);
		setMessage(null);
		try {
			const result = await manualPunch({
				workerId: auth.user.id,
				geofenceId,
				type,
				latitude,
				longitude,
			});
			const label = type === "in" ? "出勤" : "退勤";
			setMessage(
				result.dbSynced
					? `${label}を記録しました`
					: `${label}を記録しました（オフライン: 復帰後に同期します）`,
			);
			refreshEvents();
		} finally {
			setBusyGeofenceId(null);
		}
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={[
				styles.content,
				{ paddingBottom: 16 + insets.bottom },
			]}
			refreshControl={
				<RefreshControl refreshing={isPending} onRefresh={onRefresh} />
			}
		>
			<Text style={styles.title}>手動打刻</Text>
			<Text style={styles.subtitle}>
				バックグラウンド監視が動作しない時の予備手段です。勤務地の範囲内でのみ打刻できます。
			</Text>

			{currentLocation == null && (
				<Text style={styles.info}>現在地を取得中です...</Text>
			)}

			{currentLocation != null && insidePlaces.length === 0 && (
				<Text style={styles.info}>
					範囲内の勤務地がありません。勤務地の 100m 圏内へ移動してください。
				</Text>
			)}

			{insidePlaces.map((place) => (
				<PlaceCard
					key={place.status.geofence.id}
					place={place}
					disabled={busyGeofenceId === place.status.geofence.id}
					onPress={() =>
						currentLocation &&
						onPunch(
							place.status.geofence.id,
							place.nextAction,
							currentLocation.latitude,
							currentLocation.longitude,
						)
					}
				/>
			))}

			{allPlaces.length === 0 && (
				<Text style={styles.info}>登録された勤務地がありません。</Text>
			)}

			{message && (
				<View style={styles.messageBox}>
					<Text style={styles.messageText}>{message}</Text>
				</View>
			)}
		</ScrollView>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: c.background,
		},
		content: {
			padding: 16,
			gap: 12,
		},
		title: {
			fontSize: 22,
			fontWeight: "bold",
			color: c.text,
		},
		subtitle: {
			fontSize: 13,
			color: c.textSecondary,
			marginBottom: 8,
		},
		info: {
			fontSize: 14,
			color: c.textSecondary,
			textAlign: "center",
			padding: 24,
		},
		messageBox: {
			marginTop: 12,
			padding: 12,
			backgroundColor: c.surfaceMuted,
			borderRadius: 8,
		},
		messageText: {
			fontSize: 14,
			color: c.text,
			textAlign: "center",
		},
	});
