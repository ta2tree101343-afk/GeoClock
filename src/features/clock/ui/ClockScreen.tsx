import { StyleSheet, View } from "react-native";
import { AsyncBoundary } from "../../../shared/ui/AsyncBoundary";
import { ClockContainer } from "./ClockContainer";

export function ClockScreen() {
	return (
		<View style={styles.container}>
			<AsyncBoundary>
				<ClockContainer />
			</AsyncBoundary>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
