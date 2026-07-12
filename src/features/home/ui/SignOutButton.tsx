import { Pressable, StyleSheet, Text } from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";

type Props = {
	onPress: () => void;
};

export function SignOutButton({ onPress }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	return (
		<Pressable style={styles.button} onPress={onPress}>
			<Text style={styles.text}>ログアウト</Text>
		</Pressable>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		button: {
			paddingHorizontal: 12,
			paddingVertical: 8,
			backgroundColor: c.danger,
			borderRadius: 6,
		},
		text: {
			color: c.primaryContrast,
			fontSize: 13,
			fontWeight: "600",
		},
	});
