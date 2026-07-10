import { StyleSheet, View } from "react-native";
import { AsyncBoundary } from "../../../shared/ui/AsyncBoundary";
import { HomeContainer } from "./HomeContainer";

export function HomeScreen() {
	return (
		<View style={styles.container}>
			<AsyncBoundary>
				<HomeContainer />
			</AsyncBoundary>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
