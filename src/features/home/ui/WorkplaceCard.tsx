import { StyleSheet, Text, View } from "react-native";
import type { WorkplaceStatus } from "../../geofence/types";

type Props = {
	status: WorkplaceStatus;
};

export function WorkplaceCard({ status }: Props) {
	return (
		<View style={styles.card}>
			<Text style={styles.name}>📍 {status.geofence.name}</Text>
			<Text style={styles.status}>{formatStatus(status)}</Text>
		</View>
	);
}

function formatStatus(status: WorkplaceStatus): string {
	switch (status.kind) {
		case "notCheckedIn":
			return "未出勤";
		case "checkedIn":
			return `出勤中 - ${formatTime(status.checkedInAt)} IN`;
		case "checkedOut":
			return `退勤 - ${formatDateTime(status.checkedOutAt)} OUT`;
	}
}

function formatTime(date: Date): string {
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	return `${hh}:${mm}`;
}

function formatDateTime(date: Date): string {
	const now = new Date();
	const isYesterday =
		date.getDate() === now.getDate() - 1 &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear();
	const prefix = isYesterday
		? "昨日 "
		: `${date.getMonth() + 1}/${date.getDate()} `;
	return prefix + formatTime(date);
}

const styles = StyleSheet.create({
	card: {
		padding: 16,
		backgroundColor: "#fff",
		borderRadius: 12,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#ddd",
		gap: 6,
	},
	name: {
		fontSize: 16,
		fontWeight: "600",
	},
	status: {
		fontSize: 14,
		color: "#666",
	},
});
