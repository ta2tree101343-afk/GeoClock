import type { ReactElement } from "react";
import {
	FlatList,
	type RefreshControlProps,
	StyleSheet,
	Text,
	View,
} from "react-native";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";
import type { WorkplaceStatus } from "../../geofence/types";
import { WorkplaceCard } from "./WorkplaceCard";

type Props = {
	statuses: WorkplaceStatus[];
	refreshControl?: ReactElement<RefreshControlProps>;
};

export function WorkplaceList({ statuses, refreshControl }: Props) {
	const c = useColors();
	const styles = createStyles(c);
	return (
		<FlatList
			data={statuses}
			keyExtractor={(s) => s.geofence.id}
			renderItem={({ item }) => <WorkplaceCard status={item} />}
			contentContainerStyle={styles.list}
			ListEmptyComponent={
				<View style={styles.empty}>
					<Text style={styles.emptyText}>登録された勤務地はありません</Text>
				</View>
			}
			refreshControl={refreshControl}
		/>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		list: {
			padding: 16,
			gap: 12,
		},
		empty: {
			padding: 32,
			alignItems: "center",
		},
		emptyText: {
			color: c.textMuted,
			fontSize: 14,
		},
	});
