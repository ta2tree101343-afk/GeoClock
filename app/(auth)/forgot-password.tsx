import { useRouter } from "expo-router";
import { useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { requestPasswordReset } from "../../src/features/auth/services";

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async () => {
		setIsSubmitting(true);
		setError(null);
		const result = await requestPasswordReset(email);
		setIsSubmitting(false);
		if (result.isErr()) {
			setError(result.error.message);
			return;
		}
		router.push({
			pathname: "/(auth)/reset-password",
			params: { email },
		});
	};

	return (
		<View style={styles.container}>
			<Text style={styles.description}>
				登録済みのメールアドレスに確認コードを送信します
			</Text>

			<Text style={styles.label}>メールアドレス</Text>
			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				autoComplete="email"
				keyboardType="email-address"
				editable={!isSubmitting}
			/>

			{error && <Text style={styles.error}>{error}</Text>}

			<Pressable
				style={[styles.button, isSubmitting && styles.buttonDisabled]}
				disabled={isSubmitting}
				onPress={onSubmit}
			>
				<Text style={styles.buttonText}>
					{isSubmitting ? "送信中..." : "送信"}
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		gap: 8,
	},
	description: {
		fontSize: 14,
		color: "#666",
		marginBottom: 12,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		marginTop: 12,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	error: {
		color: "#c00",
		fontSize: 14,
		marginTop: 8,
	},
	button: {
		marginTop: 24,
		padding: 16,
		backgroundColor: "#007AFF",
		borderRadius: 8,
		alignItems: "center",
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
