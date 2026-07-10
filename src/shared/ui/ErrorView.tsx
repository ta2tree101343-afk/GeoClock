import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
	error: Error;
	onRetry: () => void;
};

export function ErrorView({ error, onRetry }: Props) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>エラーが発生しました</Text>
			<Text style={styles.message}>{error.message}</Text>
			<Pressable style={styles.button} onPress={onRetry}>
				<Text style={styles.buttonText}>再試行</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	message: {
		fontSize: 14,
		color: "#666",
		marginBottom: 24,
		textAlign: "center",
	},
	button: {
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
});
