import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Colors } from "../theme/colors";
import { useColors } from "../theme/useColors";

type Props = {
	error: unknown;
	onRetry: () => void;
};

function toMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "エラーが発生しました";
}

export function ErrorView({ error, onRetry }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	return (
		<View style={styles.container}>
			<Text style={styles.title}>エラーが発生しました</Text>
			<Text style={styles.message}>{toMessage(error)}</Text>
			<Pressable style={styles.button} onPress={onRetry}>
				<Text style={styles.buttonText}>再試行</Text>
			</Pressable>
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
			backgroundColor: c.background,
		},
		title: {
			fontSize: 18,
			fontWeight: "bold",
			marginBottom: 8,
			color: c.text,
		},
		message: {
			fontSize: 14,
			color: c.textSecondary,
			marginBottom: 24,
			textAlign: "center",
		},
		button: {
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
	});
