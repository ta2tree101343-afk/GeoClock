import { AppleMaps } from "expo-maps";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { Coordinate } from "../types";

type MapMarker = {
	id: string;
	title: string;
	coordinate: Coordinate;
	radius: number;
};

type Props = {
	currentLocation: Coordinate | null;
	markers: MapMarker[];
};

const DEFAULT_CENTER: Coordinate = {
	latitude: 35.6895,
	longitude: 139.6917,
};

export function WorkplaceMap({ currentLocation, markers }: Props) {
	if (Platform.OS !== "ios") {
		return (
			<View style={styles.unsupported}>
				<Text style={styles.unsupportedText}>
					地図表示は iOS のみ対応しています
				</Text>
			</View>
		);
	}

	const center = markers[0]?.coordinate ?? currentLocation ?? DEFAULT_CENTER;

	return (
		<AppleMaps.View
			style={styles.map}
			cameraPosition={{
				coordinates: center,
				zoom: 12,
			}}
			markers={markers.map((m) => ({
				id: m.id,
				title: m.title,
				coordinates: m.coordinate,
				tintColor: "#007AFF",
			}))}
			circles={markers.map((m) => ({
				id: `${m.id}-radius`,
				center: m.coordinate,
				radius: m.radius,
				lineColor: "#007AFF",
				color: "rgba(0, 122, 255, 0.15)",
				lineWidth: 2,
			}))}
			uiSettings={{
				myLocationButtonEnabled: true,
				compassEnabled: true,
			}}
		/>
	);
}

const styles = StyleSheet.create({
	map: {
		flex: 1,
	},
	unsupported: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#f0f0f0",
	},
	unsupportedText: {
		color: "#666",
		fontSize: 14,
	},
});
