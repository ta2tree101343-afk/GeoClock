import { Link } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { signInAction, authStateAtom } from "../../src/features/auth/stores";

export default function LoginScreen() {
	const state = useAtomValue(authStateAtom);
	const signIn = useSetAtom(signInAction);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const isSubmitting = state.status === "authenticating";
	const errorMessage =
		state.status === "error" ? state.error.message : null;

	return (
		<View style={styles.container}>
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

			<Text style={styles.label}>パスワード</Text>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				autoCapitalize="none"
				editable={!isSubmitting}
			/>

			{errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

			<Pressable
				style={[styles.button, isSubmitting && styles.buttonDisabled]}
				disabled={isSubmitting}
				onPress={() => signIn({ email, password })}
			>
				<Text style={styles.buttonText}>
					{isSubmitting ? "ログイン中..." : "ログイン"}
				</Text>
			</Pressable>

			<Link href="/(auth)/forgot-password" style={styles.link}>
				パスワードを忘れた方
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		gap: 8,
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
	link: {
		marginTop: 16,
		color: "#007AFF",
		fontSize: 14,
		textAlign: "center",
	},
});
