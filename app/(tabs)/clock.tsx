import { StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../src/shared/theme/colors";
import { useColors } from "../../src/shared/theme/useColors";

export default function ClockTab() {
	const c = useColors();
	const styles = createStyles(c);
	return (
		<View style={styles.container}>
			<Text style={styles.title}>打刻</Text>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: c.background,
		},
		title: {
			fontSize: 24,
			fontWeight: "bold",
			color: c.text,
		},
	});
