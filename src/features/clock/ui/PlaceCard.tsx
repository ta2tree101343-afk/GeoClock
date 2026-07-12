import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import type { ClockablePlace } from "../hooks";

type Props = {
	place: ClockablePlace;
	disabled: boolean;
	onPress: () => void;
};

export function PlaceCard({ place, disabled, onPress }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	const isIn = place.nextAction === "in";
	const label = isIn ? "出勤する" : "退勤する";

	return (
		<View style={styles.card}>
			<Text style={styles.name}>📍 {place.status.geofence.name}</Text>
			<Text style={styles.distance}>
				現在地から約 {Math.round(place.distanceMeters)}m（範囲内）
			</Text>
			<Pressable
				style={[
					styles.button,
					isIn ? styles.buttonIn : styles.buttonOut,
					disabled && styles.buttonDisabled,
				]}
				disabled={disabled}
				onPress={onPress}
			>
				<Text style={styles.buttonText}>{label}</Text>
			</Pressable>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		card: {
			padding: 16,
			backgroundColor: c.surface,
			borderRadius: 12,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: c.border,
			gap: 8,
		},
		name: {
			fontSize: 16,
			fontWeight: "600",
			color: c.text,
		},
		distance: {
			fontSize: 13,
			color: c.textSecondary,
		},
		button: {
			marginTop: 4,
			padding: 12,
			borderRadius: 8,
			alignItems: "center",
		},
		buttonIn: {
			backgroundColor: c.success,
		},
		buttonOut: {
			backgroundColor: c.textSecondary,
		},
		buttonDisabled: {
			opacity: 0.5,
		},
		buttonText: {
			color: c.primaryContrast,
			fontSize: 16,
			fontWeight: "600",
		},
	});
