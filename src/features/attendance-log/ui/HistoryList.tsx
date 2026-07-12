import type { ReactElement } from "react";
import {
	type RefreshControlProps,
	SectionList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import type { AttendanceDayGroup } from "../types";
import { EntryRow } from "./EntryRow";

type Props = {
	groups: AttendanceDayGroup[];
	refreshControl?: ReactElement<RefreshControlProps>;
};

export function HistoryList({ groups, refreshControl }: Props) {
	const sections = groups.map((g) => ({
		title: g.label,
		data: g.entries,
	}));

	return (
		<SectionList
			sections={sections}
			keyExtractor={(item) => item.id}
			renderItem={({ item }) => <EntryRow entry={item} />}
			renderSectionHeader={({ section }) => (
				<View style={styles.header}>
					<Text style={styles.headerText}>{section.title}</Text>
				</View>
			)}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
			ListEmptyComponent={
				<View style={styles.empty}>
					<Text style={styles.emptyText}>まだ勤怠履歴はありません</Text>
				</View>
			}
			refreshControl={refreshControl}
			stickySectionHeadersEnabled
		/>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#f2f2f2",
	},
	headerText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#555",
	},
	separator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "#e0e0e0",
	},
	empty: {
		padding: 40,
		alignItems: "center",
	},
	emptyText: {
		color: "#888",
		fontSize: 14,
	},
});
