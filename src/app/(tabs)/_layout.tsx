import { useThemeStore } from "@/style";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    const theme = useThemeStore(s => s.theme);

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: { display: "none" },
                sceneStyle: { backgroundColor: theme.backgroundColor },
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="profile" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}
