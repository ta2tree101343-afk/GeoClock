import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../src/shared/theme/colors";
import { useColors } from "../../src/shared/theme/useColors";

export default function ChecklistDetailScreen() {
	const c = useColors();
	const styles = createStyles(c);
	const { geofenceId } = useLocalSearchParams<{ geofenceId: string }>();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>チェックリスト詳細</Text>
			<Text style={styles.subtitle}>geofenceId: {geofenceId}</Text>
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
		subtitle: {
			marginTop: 8,
			fontSize: 14,
			color: c.textSecondary,
		},
	});
