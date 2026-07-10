import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LocationPermissionStatus } from "../types";

type Props = {
	status: LocationPermissionStatus;
	onRequest: () => void;
	children: ReactNode;
};

export function PermissionGate({ status, onRequest, children }: Props) {
	if (status === "granted") return <>{children}</>;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>位置情報の使用を許可してください</Text>
			<Text style={styles.description}>
				現在地と勤務地の位置関係を表示するために位置情報を使用します
			</Text>
			<Pressable style={styles.button} onPress={onRequest}>
				<Text style={styles.buttonText}>
					{status === "denied" ? "設定を開く" : "許可する"}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
		gap: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	description: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
	},
	button: {
		marginTop: 12,
		paddingHorizontal: 24,
		paddingVertical: 12,
		backgroundColor: "#007AFF",
		borderRadius: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	note: {
		fontSize: 12,
		color: "#999",
		textAlign: "center",
	},
});
