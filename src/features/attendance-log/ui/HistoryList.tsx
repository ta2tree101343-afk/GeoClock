import type { ReactElement } from "react";
import {
	type RefreshControlProps,
	SectionList,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import type { AttendanceDayGroup } from "../types";
import { EntryRow } from "./EntryRow";

type Props = {
	groups: AttendanceDayGroup[];
	refreshControl?: ReactElement<RefreshControlProps>;
};

export function HistoryList({ groups, refreshControl }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	const insets = useSafeAreaInsets();
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
			contentContainerStyle={{ paddingTop: insets.top }}
		/>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		header: {
			paddingHorizontal: 16,
			paddingVertical: 8,
			backgroundColor: c.surfaceMuted,
		},
		headerText: {
			fontSize: 13,
			fontWeight: "600",
			color: c.textSecondary,
		},
		separator: {
			height: StyleSheet.hairlineWidth,
			backgroundColor: c.border,
		},
		empty: {
			padding: 40,
			alignItems: "center",
		},
		emptyText: {
			color: c.textMuted,
			fontSize: 14,
		},
	});
