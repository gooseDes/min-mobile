import Storage from "@/storage";
import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import Translation from "@/translation";
import { ClearCache, getShadow } from "@/utils";
import Button from "@components/Button";
import HapticPressable from "@components/HapticPressable";
import Icon from "@components/Icon";
import Switch from "@components/Switch";
import { useTranslation } from "@contexts/TranslationContext";
import { openDropdown } from "@services/dropdownService";
import { vibrateEffectPreset } from "@specs/HapticsModule";
import { useRouter } from "expo-router";
import { JSX, useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    Keyframe,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomZoomIn = new Keyframe({
    0: {
        opacity: 0,
        transform: [{ scale: 5 }],
    },
    100: {
        opacity: 1,
        transform: [{ scale: 1 }],
        easing: Easing.in(Easing.elastic(1)),
    },
}).duration(800);

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        content: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderColor: theme.borderColor,
            borderRadius: theme.rounding,
        },
        button: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
        },
        buttonText: {
            fontSize: 24,
        },
        popupContent: {
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 16,
            paddingTop: 64,
        },
        okButton: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            position: "absolute",
            top: 10,
            left: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            aspectRatio: 1,
        },
        titleText: {
            fontSize: 24,
        },
        languageSelectorContainer: {
            backgroundColor: theme.backgroundColor,
            padding: 16,
            borderRadius: theme.rounding,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 70,
            boxShadow: getShadow(theme),
        },
        languageSelectorPressable: {
            height: "100%",
            aspectRatio: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: theme.rounding,
            overflow: "hidden",
        },
        switchContainer: {
            backgroundColor: theme.backgroundColor,
            padding: 16,
            borderRadius: theme.rounding,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            height: 70,
            boxShadow: getShadow(theme),
        },
        switchOffOnText: {
            fontSize: 18,
            flex: 1,
        },
    });

interface SettingsSectionProps {
    onExpand?: () => void;
    section: SettingsSection;
}

function SettingsSection(props: SettingsSectionProps) {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [expanded, setExpanded] = useState<boolean>(false);
    const expandedRef = useRef(expanded);

    const contentPosition = useSharedValue<"relative" | "absolute">("relative");
    const contentWidth = useSharedValue<number>(width - 40);
    const contentHeight = useSharedValue<number>(50);
    const contentBottom = useSharedValue<number>(0);
    const contentBgColor = useSharedValue<string>("#ffffff00");
    const contentBorderWidth = useSharedValue<number>(0);
    const contentZIndex = useSharedValue<number>(0);

    const { t, changeLanguage } = useTranslation();
    const styles = useAppStyles(createStyles);
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);

    // Update styles
    useEffect(() => {
        contentPosition.value = expanded ? "absolute" : "relative";
        contentWidth.value = withSpring(expanded ? width - Styles.container.paddingHorizontal * 2 : width - 40);
        contentHeight.value = withSpring(
            expanded ? height - insets.top - insets.bottom - Styles.container.paddingVertical * 2 : 50,
        );
        contentBottom.value = withSpring(expanded ? -20 : 0);
        contentBgColor.value = withSpring(expanded ? theme.backgroundPanelColorOpaque : "#ffffff00");
        contentBorderWidth.value = withSpring(expanded ? theme.borderWidth : 0);
        contentZIndex.value = expanded ? 1 : 0;
    }, [expanded, width, height, theme]);

    const contentStyle = useAnimatedStyle(() => ({
        position: contentPosition.value,
        width: contentWidth.value,
        height: contentHeight.value,
        bottom: contentBottom.value,
        backgroundColor: contentBgColor.value,
        borderWidth: contentBorderWidth.value,
        zIndex: contentZIndex.value,
    }));

    useEffect(() => {
        const listener = BackHandler.addEventListener("hardwareBackPress", () => {
            if (expandedRef.current) {
                setExpanded(false);
            } else {
                router.back();
            }
            return true;
        });
        return () => listener.remove();
    }, [expanded]);

    useEffect(() => {
        expandedRef.current = expanded;
    }, [expanded]);

    function expand() {
        setExpanded(true);
        if (props.onExpand) props.onExpand();
    }

    function itemTitle(title?: string): string {
        const ti = title || "Title";
        return (t as any)["settings_" + ti] || ti;
    }

    return (
        <Animated.View style={[styles.content, contentStyle]} layout={Constants.layoutTransition}>
            {/* Button Mode */}
            {!expanded && (
                <Animated.View entering={CustomZoomIn} exiting={FadeOut}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            expand();
                            vibrateEffectPreset("slow_rise");
                        }}
                    >
                        {props.section.icon && <Icon name={props.section.icon} size={24} color={theme.primaryTextColor} />}
                        <Text style={[Styles.primaryText, styles.buttonText]}>{itemTitle(props.section.title)}</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Popup Mode */}
            {expanded && (
                <Animated.View style={styles.popupContent} entering={FadeIn} exiting={FadeOut}>
                    {props.section.items.map((item, index) => {
                        let component: JSX.Element = <View />;
                        if (item.type === "language") {
                            component = (
                                <View>
                                    {/* Title */}
                                    <Text style={[styles.titleText, Styles.primaryCenter]}>{itemTitle(item.title)}</Text>

                                    {/* Box */}
                                    <View style={styles.languageSelectorContainer}>
                                        <Icon name="earth-americas" size={24} color={theme.secondaryTextColor} />
                                        <Text style={[Styles.secondaryCenter, { fontSize: 18 }]}>{t.language_name}</Text>
                                        <View style={{ flex: 1 }} />
                                        <HapticPressable
                                            style={styles.languageSelectorPressable}
                                            android_ripple={{ color: theme.rippleColor, foreground: true }}
                                            onPress={e =>
                                                openDropdown(e.nativeEvent.pageX, e.nativeEvent.pageY, [
                                                    {
                                                        text: Translation.en.language_name,
                                                        onPress: () => changeLanguage("en"),
                                                    },
                                                    {
                                                        text: Translation.ru.language_name,
                                                        onPress: () => changeLanguage("ru"),
                                                    },
                                                    {
                                                        text: Translation.ua.language_name,
                                                        onPress: () => changeLanguage("ua"),
                                                    },
                                                ])
                                            }
                                        >
                                            <Icon name="chevron-right" size={24} color={theme.secondaryTextColor} />
                                        </HapticPressable>
                                    </View>
                                </View>
                            );
                        } else if (item.type === "cache") {
                            component = (
                                <View>
                                    <Text style={[styles.titleText, Styles.primaryCenter]}>{itemTitle(item.title)}</Text>
                                    <View style={{ height: 16 }} />
                                    <TouchableOpacity onPress={ClearCache}>
                                        <Text
                                            style={[Styles.secondaryCenter, { textDecorationLine: "underline", fontSize: 16 }]}
                                        >
                                            {t.clear_cache}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        } else if (item.type === "switch") {
                            component = (
                                <View>
                                    <Text style={[styles.titleText, Styles.primaryCenter]}>{itemTitle(item.title)}</Text>
                                    <View style={styles.switchContainer}>
                                        <Text style={[styles.switchOffOnText, Styles.secondaryCenter]}>Off</Text>
                                        <Switch
                                            checked={Storage.getBoolean(item.storageKey ?? "") ?? false}
                                            onChange={value => Storage.set(item.storageKey ?? "", value)}
                                        />
                                        <Text style={[styles.switchOffOnText, Styles.secondaryCenter]}>On</Text>
                                    </View>
                                </View>
                            );
                        } else if (item.type === "button") {
                            component = <Button text={itemTitle(item.title)} onPress={item.onPress} style={{ height: 60 }} />;
                        } else if (item.component) {
                            component = <item.component />;
                        }
                        return (
                            <View key={index} style={{ width: "100%" }}>
                                {component}
                                <View style={{ margin: 30 }} />
                            </View>
                        );
                    })}

                    {/* Ok Button */}
                    <TouchableOpacity style={styles.okButton} onPress={() => setExpanded(false)}>
                        <Icon name="arrow-left" size={24} color={theme.primaryTextColor} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );
}

export default SettingsSection;
