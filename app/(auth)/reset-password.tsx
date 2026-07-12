import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { confirmPasswordReset } from "../../src/features/auth/services";
import type { Colors } from "../../src/shared/theme/colors";
import { useColors } from "../../src/shared/theme/useColors";

export default function ResetPasswordScreen() {
	const c = useColors();
	const styles = createStyles(c);
	const router = useRouter();
	const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async () => {
		if (newPassword.length < 8) {
			setError("パスワードは 8 文字以上で入力してください");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("パスワードが一致しません");
			return;
		}
		setIsSubmitting(true);
		setError(null);
		const result = await confirmPasswordReset(
			emailParam ?? "",
			code,
			newPassword,
		);
		setIsSubmitting(false);
		if (result.isErr()) {
			setError(result.error.message);
			return;
		}
		router.replace("/(auth)/login");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.description}>
				メールに届いた確認コードと新しいパスワードを入力してください
			</Text>

			<Text style={styles.label}>確認コード</Text>
			<TextInput
				style={styles.input}
				value={code}
				onChangeText={setCode}
				autoCapitalize="none"
				keyboardType="number-pad"
				editable={!isSubmitting}
				placeholderTextColor={c.textMuted}
			/>

			<Text style={styles.label}>新しいパスワード</Text>
			<TextInput
				style={styles.input}
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				autoCapitalize="none"
				editable={!isSubmitting}
				placeholderTextColor={c.textMuted}
			/>

			<Text style={styles.label}>確認用パスワード</Text>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				autoCapitalize="none"
				editable={!isSubmitting}
				placeholderTextColor={c.textMuted}
			/>

			{error && <Text style={styles.error}>{error}</Text>}

			<Pressable
				style={[styles.button, isSubmitting && styles.buttonDisabled]}
				disabled={isSubmitting}
				onPress={onSubmit}
			>
				<Text style={styles.buttonText}>
					{isSubmitting ? "変更中..." : "パスワードを変更"}
				</Text>
			</Pressable>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			padding: 24,
			gap: 8,
			backgroundColor: c.background,
		},
		description: {
			fontSize: 14,
			color: c.textSecondary,
			marginBottom: 12,
		},
		label: {
			fontSize: 14,
			fontWeight: "600",
			marginTop: 12,
			color: c.text,
		},
		input: {
			borderWidth: 1,
			borderColor: c.border,
			borderRadius: 8,
			padding: 12,
			fontSize: 16,
			color: c.text,
		},
		error: {
			color: c.error,
			fontSize: 14,
			marginTop: 8,
		},
		button: {
			marginTop: 24,
			padding: 16,
			backgroundColor: c.primary,
			borderRadius: 8,
			alignItems: "center",
		},
		buttonDisabled: {
			opacity: 0.5,
		},
		buttonText: {
			color: c.primaryContrast,
			fontSize: 16,
			fontWeight: "600",
		},
	});
