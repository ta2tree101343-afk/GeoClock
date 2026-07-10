import { StyleSheet, Text, View } from "react-native";

export default function LibraryTab() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>資料</Text>
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
});
