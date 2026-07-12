import { AppleMaps } from "expo-maps";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
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
	const c = useColors();
	const styles = createStyles(c);

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
				tintColor: c.primary,
			}))}
			circles={markers.map((m) => ({
				id: `${m.id}-radius`,
				center: m.coordinate,
				radius: m.radius,
				lineColor: c.primary,
				color: c.overlay,
				lineWidth: 2,
			}))}
			uiSettings={{
				myLocationButtonEnabled: true,
				compassEnabled: true,
			}}
		/>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		map: {
			flex: 1,
		},
		unsupported: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: c.surfaceMuted,
		},
		unsupportedText: {
			color: c.textSecondary,
			fontSize: 14,
		},
	});
