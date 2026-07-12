import { StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import type { AttendanceEntry } from "../types";

type Props = {
	entry: AttendanceEntry;
};

export function EntryRow({ entry }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	const isIn = entry.type === "in";
	return (
		<View style={styles.row}>
			<View style={[styles.badge, isIn ? styles.badgeIn : styles.badgeOut]}>
				<Text style={styles.badgeText}>{isIn ? "IN" : "OUT"}</Text>
			</View>
			<View style={styles.body}>
				<Text style={styles.name}>{entry.geofenceName}</Text>
				<Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
			</View>
		</View>
	);
}

function formatTime(date: Date): string {
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 12,
			paddingHorizontal: 16,
			backgroundColor: c.surface,
			gap: 12,
		},
		badge: {
			width: 44,
			height: 28,
			borderRadius: 6,
			alignItems: "center",
			justifyContent: "center",
		},
		badgeIn: {
			backgroundColor: c.success,
		},
		badgeOut: {
			backgroundColor: c.textSecondary,
		},
		badgeText: {
			color: c.primaryContrast,
			fontSize: 12,
			fontWeight: "700",
		},
		body: {
			flex: 1,
		},
		name: {
			fontSize: 15,
			fontWeight: "600",
			color: c.text,
		},
		time: {
			fontSize: 13,
			color: c.textSecondary,
			marginTop: 2,
		},
	});
