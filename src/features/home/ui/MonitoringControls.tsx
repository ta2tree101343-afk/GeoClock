import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import type { LocationPermissionStatus } from "../../location/types";
import type { NotificationPermissionStatus } from "../../notification/types";

type Props = {
	isActive: boolean;
	backgroundPermission: LocationPermissionStatus;
	notificationPermission: NotificationPermissionStatus;
	onRequestBackground: () => void;
	onRequestNotification: () => void;
	onStart: () => void;
	onStop: () => void;
};

export function MonitoringControls({
	isActive,
	backgroundPermission,
	notificationPermission,
	onRequestBackground,
	onRequestNotification,
	onStart,
	onStop,
}: Props) {
	const c = useColors();
	const styles = createStyles(c);
	const bgReady = backgroundPermission === "granted";
	const notifReady = notificationPermission === "granted";
	const canStart = bgReady && notifReady;

	return (
		<View style={styles.container}>
			<View style={styles.statusRow}>
				<Text style={styles.statusLabel}>ジオフェンス監視</Text>
				<Text style={[styles.statusValue, isActive && styles.statusActive]}>
					{isActive ? "動作中" : "停止中"}
				</Text>
			</View>

			{!bgReady && (
				<Pressable style={styles.smallButton} onPress={onRequestBackground}>
					<Text style={styles.smallButtonText}>
						バックグラウンドでの位置情報を許可
					</Text>
				</Pressable>
			)}

			{!notifReady && (
				<Pressable style={styles.smallButton} onPress={onRequestNotification}>
					<Text style={styles.smallButtonText}>通知を許可</Text>
				</Pressable>
			)}

			{canStart && !isActive && (
				<Pressable style={styles.primaryButton} onPress={onStart}>
					<Text style={styles.primaryButtonText}>監視を開始</Text>
				</Pressable>
			)}

			{isActive && (
				<Pressable style={styles.dangerButton} onPress={onStop}>
					<Text style={styles.dangerButtonText}>監視を停止</Text>
				</Pressable>
			)}
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			padding: 12,
			gap: 8,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: c.border,
		},
		statusRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		statusLabel: {
			fontSize: 14,
			color: c.textSecondary,
		},
		statusValue: {
			fontSize: 14,
			fontWeight: "600",
			color: c.textMuted,
		},
		statusActive: {
			color: c.success,
		},
		smallButton: {
			paddingVertical: 8,
			paddingHorizontal: 12,
			backgroundColor: c.surfaceMuted,
			borderRadius: 6,
			alignItems: "center",
		},
		smallButtonText: {
			fontSize: 13,
			color: c.text,
		},
		primaryButton: {
			paddingVertical: 10,
			paddingHorizontal: 16,
			backgroundColor: c.primary,
			borderRadius: 8,
			alignItems: "center",
		},
		primaryButtonText: {
			color: c.primaryContrast,
			fontSize: 14,
			fontWeight: "600",
		},
		dangerButton: {
			paddingVertical: 10,
			paddingHorizontal: 16,
			backgroundColor: c.textSecondary,
			borderRadius: 8,
			alignItems: "center",
		},
		dangerButtonText: {
			color: c.primaryContrast,
			fontSize: 14,
			fontWeight: "600",
		},
	});
