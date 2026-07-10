import { StyleSheet, Text, View } from "react-native";

export default function CafeteriaTab() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>食堂</Text>
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
