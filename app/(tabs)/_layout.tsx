import { Tabs } from "expo-router";

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen name="index" options={{ title: "ホーム" }} />
			<Tabs.Screen name="clock" options={{ title: "打刻" }} />
			<Tabs.Screen name="checklist" options={{ title: "チェック" }} />
			<Tabs.Screen name="cafeteria" options={{ title: "食堂" }} />
			<Tabs.Screen name="history" options={{ title: "履歴" }} />
			<Tabs.Screen name="library" options={{ title: "資料" }} />
		</Tabs>
	);
}
