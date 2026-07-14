import { useAtomValue, useSetAtom } from "jotai";
import { useTransition } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { currentMonthKey, isSameMonth } from "../../../shared/lib/date";
import {
	attendanceDayGroupsAtom,
	monthlySummaryAtom,
	nextMonthAction,
	previousMonthAction,
	refreshAttendanceLogAction,
	resetToCurrentMonthAction,
	selectedMonthAtom,
} from "../stores";
import { HistoryList } from "./HistoryList";
import { MonthlySummary } from "./MonthlySummary";
import { MonthNavigator } from "./MonthNavigator";

export function HistoryContainer() {
	const insets = useSafeAreaInsets();
	const groups = useAtomValue(attendanceDayGroupsAtom);
	const summary = useAtomValue(monthlySummaryAtom);
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
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<MonthNavigator
				month={month}
				onPrevious={() => startTransition(() => goPrev())}
				onNext={() => startTransition(() => goNext())}
				onResetToCurrent={
					isCurrentMonth ? undefined : () => startTransition(() => goCurrent())
				}
				nextDisabled={isCurrentMonth}
			/>
			<MonthlySummary
				totalWorkedSeconds={summary.totalWorkedSeconds}
				sessionCount={summary.sessionCount}
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
