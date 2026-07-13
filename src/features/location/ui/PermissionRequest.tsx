import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import { useLocationPermission } from "../hooks";
import { requestPermissionAction } from "../stores";
import { useSetAtom } from "jotai";

type Props = {
	onComplete?: () => void | Promise<void>;
};

export function PermissionRequest({ onComplete }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	const insets = useSafeAreaInsets();
	const { status, refresh } = useLocationPermission();
	const requestPermission = useSetAtom(requestPermissionAction);

	const handleRequest = async () => {
		await requestPermission();
		await refresh();
		await onComplete?.();
	};

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: 24 + insets.top,
					paddingBottom: 24 + insets.bottom,
				},
			]}
		>
			<Text style={styles.title}>位置情報の使用を許可してください</Text>
			<Text style={styles.description}>
				現在地と勤務地の位置関係を表示するために、位置情報を使用します。
			</Text>
			<Pressable style={styles.button} onPress={handleRequest}>
				<Text style={styles.buttonText}>
					{status === "denied" ? "設定を開いてください" : "許可する"}
				</Text>
			</Pressable>
			{status === "denied" && (
				<Text style={styles.note}>
					※ 拒否済みの場合、iOS の設定アプリから変更が必要です
				</Text>
			)}
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			padding: 24,
			gap: 12,
			backgroundColor: c.background,
		},
		title: {
			fontSize: 18,
			fontWeight: "bold",
			color: c.text,
		},
		description: {
			fontSize: 14,
			color: c.textSecondary,
			textAlign: "center",
		},
		button: {
			marginTop: 12,
			paddingHorizontal: 24,
			paddingVertical: 12,
			backgroundColor: c.primary,
			borderRadius: 8,
		},
		buttonText: {
			color: c.primaryContrast,
			fontSize: 16,
			fontWeight: "600",
		},
		note: {
			fontSize: 12,
			color: c.textMuted,
			textAlign: "center",
		},
	});
