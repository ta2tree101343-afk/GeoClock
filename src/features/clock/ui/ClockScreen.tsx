import { StyleSheet, View } from "react-native";
import { ClockContainer } from "./ClockContainer";

export function ClockScreen() {
	return (
		<View style={styles.container}>
			<ClockContainer />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
