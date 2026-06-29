import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { setAlphaForColor } from "@/utils";
import CustomIcon, { IconName } from "@components/CustomIcon";
import PressableWithEffect from "@components/PressableWithEffect";
import { tabBarRef } from "@services/tabBarControlService";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { Ref, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const routeNameToIcon: Record<string, IconName> = {
    index: "home",
    profile: "accout_circle",
    settings: "settings",
};

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        tabBar: {
            position: "absolute",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            height: 60,
            borderRadius: 30,
            padding: 4,
        },
        tabBarItem: {
            height: 50,
            width: 50,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 25,
        },
        selectIndicator: {
            position: "absolute",
            backgroundColor: setAlphaForColor(theme.rippleColor, 0.1),
            borderRadius: 25,
            zIndex: 1,
            pointerEvents: "none",
        },
    });

export interface TabBarHandle {
    setVisibility: (visible: boolean) => void;
}

export interface TabBarProps extends BottomTabBarProps {
    ref: Ref<TabBarHandle>;
}

function TabBar(props: TabBarProps) {
    const { state, navigation, ref } = props;

    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);
    const styles = useAppStyles(createStyles);
    const insets = useSafeAreaInsets();

    const [tabLayouts, setTabLayouts] = useState<Record<number, Rect>>({});

    const selectIndicatorX = useSharedValue<number>(0);
    const selectIndicatorY = useSharedValue<number>(0);
    const selectIndicatorWidth = useSharedValue<number>(0);
    const selectIndicatorHeight = useSharedValue<number>(0);

    function handlePress(index: number) {
        navigation.navigate(state.routes[index].name);
    }

    useImperativeHandle(ref, () => ({
        setVisibility: (visible: boolean) => {
            opacity.value = withSpring(visible ? 1 : 0);
            scale.value = withSpring(visible ? 1 : 0);
        },
    }));

    function handleLayout(e: LayoutChangeEvent, index: number) {
        const { x, y, width, height } = e.nativeEvent.layout;
        if (index === 0 && selectIndicatorWidth.value === 0) {
            selectIndicatorX.value = x;
            selectIndicatorY.value = y;
            selectIndicatorWidth.value = width - 4;
            selectIndicatorHeight.value = height - 4;
        }
        setTabLayouts(prev => {
            prev[index] = { x, y, width, height };
            const newLayouts = prev;
            return newLayouts;
        });
    }

    useEffect(() => {
        selectIndicatorX.value = tabLayouts[state.index]?.x ?? 0;
        selectIndicatorY.value = tabLayouts[state.index]?.y ?? 0;
        selectIndicatorWidth.value = (tabLayouts[state.index]?.width ?? 0) - 4;
        selectIndicatorHeight.value = (tabLayouts[state.index]?.height ?? 0) - 4;
    }, [state.index, tabLayouts]);

    const opacity = useSharedValue<number>(1);
    const scale = useSharedValue<number>(1);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[
                Styles.panel,
                styles.tabBar,
                { bottom: insets.bottom + Styles.container.paddingVertical + 10 },
                animatedStyle,
            ]}
        >
            <Animated.View
                entering={ZoomIn}
                exiting={ZoomOut}
                layout={Constants.layoutTransition}
                style={[
                    styles.selectIndicator,
                    {
                        left: selectIndicatorX,
                        top: selectIndicatorY,
                        width: selectIndicatorWidth,
                        height: selectIndicatorHeight,
                    },
                ]}
            />
            {state.routes.map((route, index) => (
                <View key={index} onLayout={e => handleLayout(e, index)}>
                    <PressableWithEffect
                        style={styles.tabBarItem}
                        containerStyle={styles.tabBarItem}
                        onPress={() => handlePress(index)}
                    >
                        <CustomIcon
                            name={routeNameToIcon[route.name]}
                            iconStyle={state.index === index ? "filled" : "outlined"}
                            style={{ zIndex: 2 }}
                            color={state.index === index ? theme.accentColor : theme.secondaryTextColor}
                        />
                    </PressableWithEffect>
                </View>
            ))}
        </Animated.View>
    );
}

export default function TabsLayout() {
    const theme = useThemeStore(s => s.theme);

    const tabBarFunc = useCallback((props: BottomTabBarProps) => <TabBar ref={tabBarRef} {...props} />, [TabBar]);

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
