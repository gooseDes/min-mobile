import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import PressableWithEffect from "@components/PressableWithEffect";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const routeNameToIcon = {
    index: {
        regular: "home-outline",
        active: "home",
    },
    profile: {
        regular: "person-outline",
        active: "person",
    },
    settings: {
        regular: "settings-outline",
        active: "settings-sharp",
    },
};

const createStyles = (_theme: ThemeData) =>
    StyleSheet.create({
        tabBar: {
            position: "absolute",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            height: 60,
            borderRadius: 30,
        },
        tabBarItem: {
            height: 50,
            width: 50,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 25,
        },
    });

function TabBar(props: BottomTabBarProps) {
    const { state, navigation } = props;

    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);
    const styles = useAppStyles(createStyles);
    const insets = useSafeAreaInsets();

    return (
        <View style={[Styles.bgAndBorder, styles.tabBar, { bottom: insets.bottom + Styles.container.paddingVertical + 10 }]}>
            {state.routes.map((route, index) => (
                <PressableWithEffect
                    style={styles.tabBarItem}
                    containerStyle={styles.tabBarItem}
                    key={index}
                    onPress={() => navigation.navigate(route.name)}
                >
                    <Ionicons
                        name={
                            routeNameToIcon[route.name as keyof typeof routeNameToIcon][
                                state.index === index ? "active" : "regular"
                            ] as any
                        }
                        size={24}
                        color={theme.primaryTextColor}
                    />
                </PressableWithEffect>
            ))}
        </View>
    );
}

export default function TabsLayout() {
    const theme = useThemeStore(s => s.theme);

    const tabBarFunc = useCallback((props: BottomTabBarProps) => <TabBar {...props} />, [TabBar]);

    return (
        <Tabs
            tabBar={tabBarFunc}
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                sceneStyle: { backgroundColor: theme.backgroundColor },
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="profile" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}
