import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatMonthLabel, type MonthKey } from "../../../shared/lib/date";
import type { Colors } from "../../../shared/theme/colors";
import { useColors } from "../../../shared/theme/useColors";

type Props = {
	month: MonthKey;
	onPrevious: () => void;
	onNext: () => void;
	onResetToCurrent?: () => void;
	/** ボタンを disabled にする（例: 未来には行けない） */
	nextDisabled?: boolean;
};

export function MonthNavigator({
	month,
	onPrevious,
	onNext,
	onResetToCurrent,
	nextDisabled = false,
}: Props) {
	const c = useColors();
	const styles = createStyles(c);

	return (
		<View style={styles.container}>
			<Pressable
				style={styles.iconButton}
				onPress={onPrevious}
				hitSlop={12}
				accessibilityLabel="前月"
			>
				<Ionicons name="chevron-back" size={22} color={c.primary} />
			</Pressable>

			<Pressable
				style={styles.labelButton}
				onPress={onResetToCurrent}
				disabled={onResetToCurrent == null}
				accessibilityLabel={`${formatMonthLabel(month)} (タップで今月へ)`}
			>
				<Text style={styles.label}>{formatMonthLabel(month)}</Text>
			</Pressable>

			<Pressable
				style={[styles.iconButton, nextDisabled && styles.iconButtonDisabled]}
				onPress={onNext}
				disabled={nextDisabled}
				hitSlop={12}
				accessibilityLabel="翌月"
			>
				<Ionicons
					name="chevron-forward"
					size={22}
					color={nextDisabled ? c.textMuted : c.primary}
				/>
			</Pressable>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: 16,
			paddingVertical: 10,
			backgroundColor: c.surface,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: c.border,
		},
		iconButton: {
			padding: 6,
		},
		iconButtonDisabled: {
			opacity: 0.5,
		},
		labelButton: {
			flex: 1,
			alignItems: "center",
		},
		label: {
			fontSize: 16,
			fontWeight: "600",
			color: c.text,
		},
	});
