import { AppleMaps } from "expo-maps";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
	fitBounds,
	shouldIncludeCurrentLocation,
} from "../../../shared/lib/geo";
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
	// 勤務地に近い場合のみ fit bounds に含まれる（遠い時は勤務地だけを表示）。
	// 青ドット (isMyLocationEnabled) では常に画面上に描画される。
	currentLocation: Coordinate | null;
	markers: MapMarker[];
};

const DEFAULT_CAMERA = {
	coordinates: { latitude: 35.6895, longitude: 139.6917 },
	zoom: 12,
};

// 現在地を fit bounds に含める最大距離（約 50km、通勤圏の目安）。
const INCLUDE_CURRENT_LOCATION_THRESHOLD_METERS = 50_000;

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

	// 現在地が勤務地から遠い時 (Simulator デフォルト = SF など) は
	// fit bounds から除外し、地図が世界規模でズームアウトするのを防ぐ。
	// 青ドット自体は isMyLocationEnabled で常に表示される。
	const anchors: Coordinate[] = markers.map((m) => m.coordinate);
	if (
		currentLocation != null &&
		shouldIncludeCurrentLocation(
			currentLocation,
			anchors,
			INCLUDE_CURRENT_LOCATION_THRESHOLD_METERS,
		)
	) {
		anchors.push(currentLocation);
	}
	const cameraPosition = fitBounds(anchors, { padding: 1 }) ?? DEFAULT_CAMERA;

	return (
		<AppleMaps.View
			style={styles.map}
			cameraPosition={cameraPosition}
			properties={{ isMyLocationEnabled: true }}
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
