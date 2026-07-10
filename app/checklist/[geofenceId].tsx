import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ChecklistDetailScreen() {
	const { geofenceId } = useLocalSearchParams<{ geofenceId: string }>();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>チェックリスト詳細</Text>
			<Text style={styles.subtitle}>geofenceId: {geofenceId}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	subtitle: {
		marginTop: 8,
		fontSize: 14,
		color: "#666",
	},
});
