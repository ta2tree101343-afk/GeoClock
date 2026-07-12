import { useAtomValue, useSetAtom } from "jotai";
import { useTransition } from "react";
import { RefreshControl } from "react-native";
import {
	attendanceDayGroupsAtom,
	refreshAttendanceLogAction,
} from "../stores";
import { HistoryList } from "./HistoryList";

export function HistoryContainer() {
	const groups = useAtomValue(attendanceDayGroupsAtom);
	const refresh = useSetAtom(refreshAttendanceLogAction);
	const [isPending, startTransition] = useTransition();

	const refreshControl = (
		<RefreshControl
			refreshing={isPending}
			onRefresh={() => startTransition(() => refresh())}
		/>
	);

	return <HistoryList groups={groups} refreshControl={refreshControl} />;
}
