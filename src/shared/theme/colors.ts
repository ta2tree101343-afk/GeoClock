export type Colors = {
	primary: string;
	primaryContrast: string;
	background: string;
	surface: string;
	surfaceMuted: string;
	border: string;
	text: string;
	textSecondary: string;
	textMuted: string;
	success: string;
	danger: string;
	warning: string;
	error: string;
	overlay: string;
};

export const lightColors: Colors = {
	primary: "#007AFF",
	primaryContrast: "#FFFFFF",
	background: "#FFFFFF",
	surface: "#FFFFFF",
	surfaceMuted: "#F2F2F7",
	border: "#E5E5EA",
	text: "#111111",
	textSecondary: "#666666",
	textMuted: "#999999",
	success: "#00A550",
	danger: "#CC0000",
	warning: "#FF9500",
	error: "#CC0000",
	overlay: "rgba(0, 122, 255, 0.15)",
};

export const darkColors: Colors = {
	primary: "#0A84FF",
	primaryContrast: "#FFFFFF",
	background: "#000000",
	surface: "#1C1C1E",
	surfaceMuted: "#2C2C2E",
	border: "#38383A",
	text: "#FFFFFF",
	textSecondary: "#AEAEB2",
	textMuted: "#8E8E93",
	success: "#30D158",
	danger: "#FF453A",
	warning: "#FF9F0A",
	error: "#FF453A",
	overlay: "rgba(10, 132, 255, 0.20)",
};
