import { StyleSheet, View } from "react-native";
import { HomeContainer } from "./HomeContainer";

export function HomeScreen() {
	return (
		<View style={styles.container}>
			<HomeContainer />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
