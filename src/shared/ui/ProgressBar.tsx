import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { Colors } from "../theme/colors";
import { useColors } from "../theme/useColors";
import { computeRatio } from "./progressBar.utils";

type Props = {
	/** 完了数 */
	current: number;
	/** 全体数 */
	total: number;
	/** ラベル表示（例: "3 / 10"）を左側に出すか */
	showLabel?: boolean;
	/** ラベルの最小幅を確保（数字の桁で幅が動くのを防ぐ） */
	labelMinWidth?: number;
	/** バーの高さ (px) */
	height?: number;
	/** 追加のコンテナスタイル */
	style?: ViewStyle;
};

/**
 * 汎用の進捗バー。ラベル "current / total" とバーを 1 行で表示。
 *
 * total が 0 の場合は 0% として扱う。
 * current が total を超える場合は 100% に丸める。
 */
export function ProgressBar({
	current,
	total,
	showLabel = true,
	labelMinWidth = 40,
	height = 2,
	style,
}: Props) {
	const c = useColors();
	const styles = createStyles(c);

	const ratio = computeRatio(current, total);
	const percent = Math.round(ratio * 100);

	return (
		<View style={[styles.row, style]}>
			{showLabel && (
				<Text style={[styles.label, { minWidth: labelMinWidth }]}>
					{current} / {total}
				</Text>
			)}
			<View style={[styles.track, { height }]}>
				<View style={[styles.fill, { width: `${percent}%`, height }]} />
			</View>
		</View>
	);
}

const createStyles = (c: Colors) =>
	StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
		},
		label: {
			fontSize: 12,
			color: c.textSecondary,
		},
		track: {
			flex: 1,
			backgroundColor: c.border,
			borderRadius: 2,
			overflow: "hidden",
		},
		fill: {
			backgroundColor: c.primary,
		},
	});
