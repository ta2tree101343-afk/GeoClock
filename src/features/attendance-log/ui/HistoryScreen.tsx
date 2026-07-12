import { StyleSheet, View } from "react-native";
import { AsyncBoundary } from "../../../shared/ui/AsyncBoundary";
import { HistoryContainer } from "./HistoryContainer";

export function HistoryScreen() {
	return (
		<View style={styles.container}>
			<AsyncBoundary>
				<HistoryContainer />
			</AsyncBoundary>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
