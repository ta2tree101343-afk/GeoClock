import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import {
	authStateAtom,
	completeNewPasswordAction,
} from "../../src/features/auth/stores";

export default function NewPasswordScreen() {
	const state = useAtomValue(authStateAtom);
	const submit = useSetAtom(completeNewPasswordAction);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	if (state.status !== "needsNewPassword" && state.status !== "authenticating") {
		return null;
	}

	const email = state.status === "needsNewPassword" ? state.email : "";
	const isSubmitting = state.status === "authenticating";

	const onSubmit = () => {
		if (newPassword.length < 8) {
			setLocalError("パスワードは 8 文字以上で入力してください");
			return;
		}
		if (newPassword !== confirmPassword) {
			setLocalError("パスワードが一致しません");
			return;
		}
		setLocalError(null);
		submit({ email, newPassword });
	};

	return (
		<View style={styles.container}>
			<Text style={styles.description}>
				初回ログインのため、新しいパスワードを設定してください
			</Text>

			<Text style={styles.label}>新しいパスワード</Text>
			<TextInput
				style={styles.input}
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				autoCapitalize="none"
				editable={!isSubmitting}
			/>

			<Text style={styles.label}>確認用パスワード</Text>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				autoCapitalize="none"
				editable={!isSubmitting}
			/>

			{localError && <Text style={styles.error}>{localError}</Text>}

			<Pressable
				style={[styles.button, isSubmitting && styles.buttonDisabled]}
				disabled={isSubmitting}
				onPress={onSubmit}
			>
				<Text style={styles.buttonText}>
					{isSubmitting ? "変更中..." : "変更"}
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
