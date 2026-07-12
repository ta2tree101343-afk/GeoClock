import { useColorScheme } from "react-native";
import { type Colors, darkColors, lightColors } from "./colors";

export function useColors(): Colors {
	const scheme = useColorScheme();
	return scheme === "dark" ? darkColors : lightColors;
}
