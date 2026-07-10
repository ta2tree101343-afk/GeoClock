import { useAtomValue, useSetAtom } from "jotai";
import { useTransition } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { authStateAtom, signOutAction } from "../../auth/stores";
import {
	refreshWorkplaceStatusesAction,
	workplaceStatusesAtom,
} from "../../geofence/stores";
import { WorkplaceList } from "./WorkplaceList";
import { SignOutButton } from "./SignOutButton";

export function HomeContainer() {
	const auth = useAtomValue(authStateAtom);
	const statuses = useAtomValue(workplaceStatusesAtom);
	const refresh = useSetAtom(refreshWorkplaceStatusesAction);
	const signOut = useSetAtom(signOutAction);
	const [isPending, startTransition] = useTransition();

	const displayName = auth.status === "authenticated" ? auth.user.name : "";

	const refreshControl = (
		<RefreshControl
			refreshing={isPending}
			onRefresh={() => startTransition(() => refresh())}
		/>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.greeting}>{displayName} さん</Text>
				<SignOutButton onPress={() => signOut()} />
			</View>
			<WorkplaceList statuses={statuses} refreshControl={refreshControl} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#ccc",
	},
	greeting: {
		fontSize: 16,
		fontWeight: "600",
	},
});
