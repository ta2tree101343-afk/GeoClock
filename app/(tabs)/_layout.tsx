import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSignOut } from "../../src/features/auth/hooks";
import { useLocationPermission } from "../../src/features/location/hooks";
import { PermissionRequest } from "../../src/features/location/ui/PermissionRequest";
import { useWorkerInitialization } from "../../src/features/worker/hooks";
import type { Colors } from "../../src/shared/theme/colors";
import { useColors } from "../../src/shared/theme/useColors";

export default function TabsLayout() {
	const c = useColors();
	const styles = createStyles(c);
	const { isLoading, error, retry } = useWorkerInitialization();
	const { status: permissionStatus, refresh: refreshPermission } =
		useLocationPermission();
	const handleSignOut = useSignOut();

	if (isLoading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color={c.primary} />
				<Text style={styles.loadingText}>読み込み中...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.center}>
				<Text style={styles.errorIcon}>⚠️</Text>
				<Text style={styles.errorText}>{error}</Text>
				<Pressable style={styles.retryButton} onPress={retry}>
					<Text style={styles.retryButtonText}>再試行</Text>
				</Pressable>
				<Pressable style={styles.signOutLink} onPress={handleSignOut}>
					<Text style={styles.signOutLinkText}>ログアウト</Text>
				</Pressable>
			</View>
		);
	}

	if (permissionStatus !== "granted") {
		return (
			<PermissionRequest
				onComplete={async () => {
					await refreshPermission();
				}}
			/>
		);
	}

	return (
		<NativeTabs tintColor={c.primary}>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon
					sf={{ default: "house", selected: "house.fill" }}
					src={
						<NativeTabs.Trigger.VectorIcon
							family={Ionicons}
							name="home-outline"
						/>
					}
				/>
				<NativeTabs.Trigger.Label>ホーム</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="clock">
				<NativeTabs.Trigger.Icon
					sf={{ default: "clock", selected: "clock.fill" }}
					src={
						<NativeTabs.Trigger.VectorIcon
							family={Ionicons}
							name="time-outline"
						/>
					}
				/>
				<NativeTabs.Trigger.Label>打刻</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="checklist">
				<NativeTabs.Trigger.Icon
					sf={{ default: "checklist", selected: "checklist" }}
					src={
						<NativeTabs.Trigger.VectorIcon
							family={Ionicons}
							name="checkmark-done-outline"
						/>
					}
				/>
				<NativeTabs.Trigger.Label>チェック</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="cafeteria">
				<NativeTabs.Trigger.Icon
					sf={{ default: "fork.knife", selected: "fork.knife.circle.fill" }}
					src={
						<NativeTabs.Trigger.VectorIcon
							family={Ionicons}
							name="restaurant-outline"
						/>
					}
				/>
				<NativeTabs.Trigger.Label>食堂</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="history">
				<NativeTabs.Trigger.Icon
					sf={{ default: "doc.text", selected: "doc.text.fill" }}
					src={
						<NativeTabs.Trigger.VectorIcon
							family={Ionicons}
							name="document-text-outline"
						/>
					}
				/>
				<NativeTabs.Trigger.Label>履歴</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="library">
				<NativeTabs.Trigger.Icon
					sf={{ default: "book", selected: "book.fill" }}
					src={
						<NativeTabs.Trigger.VectorIcon
							family={Ionicons}
							name="book-outline"
						/>
					}
				/>
				<NativeTabs.Trigger.Label>資料</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		center: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			padding: 24,
			backgroundColor: c.background,
		},
		loadingText: {
			marginTop: 12,
			fontSize: 16,
			color: c.textSecondary,
		},
		errorIcon: {
			fontSize: 48,
			marginBottom: 16,
		},
		errorText: {
			fontSize: 16,
			color: c.error,
			textAlign: "center",
			marginBottom: 24,
		},
		retryButton: {
			backgroundColor: c.primary,
			paddingVertical: 12,
			paddingHorizontal: 24,
			borderRadius: 8,
			marginBottom: 16,
		},
		retryButtonText: {
			color: c.primaryContrast,
			fontSize: 16,
			fontWeight: "600",
		},
		signOutLink: {
			padding: 8,
		},
		signOutLinkText: {
			fontSize: 14,
			color: c.textSecondary,
		},
	});
