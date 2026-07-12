import { StyleSheet, View } from "react-native";
import { HistoryContainer } from "./HistoryContainer";

export function HistoryScreen() {
	return (
		<View style={styles.container}>
			<HistoryContainer />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
