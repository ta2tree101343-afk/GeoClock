import { useAtomValue, useSetAtom } from "jotai";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { authStateAtom, signOutAction } from "../../auth/stores";

export function HomeScreen() {
	const state = useAtomValue(authStateAtom);
	const signOut = useSetAtom(signOutAction);

	const displayName =
		state.status === "authenticated" ? state.user.name : "ゲスト";

	return (
		<View style={styles.container}>
			<Text style={styles.title}>ホーム</Text>
			<Text style={styles.subtitle}>{displayName} さん</Text>
			<Pressable style={styles.button} onPress={() => signOut()}>
				<Text style={styles.buttonText}>ログアウト</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
	},
	button: {
		marginTop: 24,
		paddingHorizontal: 24,
		paddingVertical: 12,
		backgroundColor: "#c00",
		borderRadius: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
