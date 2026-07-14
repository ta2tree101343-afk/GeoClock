import { useAtomValue, useSetAtom } from "jotai";
import { useTransition } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import {
	currentMonthKey,
	isSameMonth,
} from "../../../shared/lib/date";
import {
	attendanceDayGroupsAtom,
	nextMonthAction,
	previousMonthAction,
	refreshAttendanceLogAction,
	resetToCurrentMonthAction,
	selectedMonthAtom,
} from "../stores";
import { HistoryList } from "./HistoryList";
import { MonthNavigator } from "./MonthNavigator";

export function HistoryContainer() {
	const groups = useAtomValue(attendanceDayGroupsAtom);
	const month = useAtomValue(selectedMonthAtom);
	const refresh = useSetAtom(refreshAttendanceLogAction);
	const goPrev = useSetAtom(previousMonthAction);
	const goNext = useSetAtom(nextMonthAction);
	const goCurrent = useSetAtom(resetToCurrentMonthAction);
	const [isPending, startTransition] = useTransition();

	const refreshControl = (
		<RefreshControl
			refreshing={isPending}
			onRefresh={() => startTransition(() => refresh())}
		/>
	);

	const now = currentMonthKey();
	const isCurrentMonth = isSameMonth(month, now);

	return (
		<View style={styles.container}>
			<MonthNavigator
				month={month}
				onPrevious={() => startTransition(() => goPrev())}
				onNext={() => startTransition(() => goNext())}
				onResetToCurrent={
					isCurrentMonth ? undefined : () => startTransition(() => goCurrent())
				}
				nextDisabled={isCurrentMonth}
			/>
			<HistoryList groups={groups} refreshControl={refreshControl} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
