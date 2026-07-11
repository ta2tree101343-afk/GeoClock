import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack>
			<Stack.Screen name="login" options={{ title: "ログイン" }} />
			<Stack.Screen name="new-password" options={{ title: "パスワード変更" }} />
			<Stack.Screen
				name="forgot-password"
				options={{ title: "パスワードリセット" }}
			/>
			<Stack.Screen
				name="reset-password"
				options={{ title: "新しいパスワード" }}
			/>
		</Stack>
	);
}
