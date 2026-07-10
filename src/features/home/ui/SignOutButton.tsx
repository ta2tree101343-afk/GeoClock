import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
	onPress: () => void;
};

export function SignOutButton({ onPress }: Props) {
	return (
		<Pressable style={styles.button} onPress={onPress}>
			<Text style={styles.text}>ログアウト</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: "#c00",
		borderRadius: 6,
	},
	text: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "600",
	},
});
