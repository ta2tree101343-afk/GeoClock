import { StyleSheet, Text, View } from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import { formatWorkedDuration } from "../summary";

type Props = {
	totalWorkedSeconds: number;
	sessionCount: number;
};

export function MonthlySummary({ totalWorkedSeconds, sessionCount }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	return (
		<View style={styles.container}>
			<View style={styles.item}>
				<Text style={styles.label}>合計勤務時間</Text>
				<Text style={styles.value}>
					{formatWorkedDuration(totalWorkedSeconds)}
				</Text>
			</View>
			<View style={styles.divider} />
			<View style={styles.item}>
				<Text style={styles.label}>打刻回数</Text>
				<Text style={styles.value}>{sessionCount}</Text>
			</View>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flexDirection: "row",
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: c.surface,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: c.border,
		},
		item: {
			flex: 1,
			alignItems: "center",
			gap: 4,
		},
		divider: {
			width: StyleSheet.hairlineWidth,
			backgroundColor: c.border,
		},
		label: {
			fontSize: 12,
			color: c.textSecondary,
		},
		value: {
			fontSize: 18,
			fontWeight: "700",
			color: c.text,
		},
	});
