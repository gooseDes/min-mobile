import Storage from "@/Storage";
import { Colors, Constants, Styles } from "@/Style";
import Translation from "@/Translation";
import { useTranslation } from "@/TranslationContext";
import { ClearCache } from "@/Utils";
import Icon from "@components/Icon";
import Switch from "@components/Switch";
import { openDropdown } from "@services/DropdownService";
import { goBack } from "@services/NavigationService";
import { JSX, useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    Keyframe,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

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

const styles = StyleSheet.create({
    content: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderColor: Colors.borderColor,
        borderRadius: Constants.rounding,
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
        ...Styles.primaryCenter,
        fontSize: 24,
    },
    languageSelectorContainer: {
        backgroundColor: Colors.backgroundColor,
        padding: 16,
        borderRadius: Constants.rounding,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: 70,
        boxShadow: Constants.shadow,
    },
    languageSelectorPressable: {
        height: "100%",
        aspectRatio: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: Constants.rounding,
        overflow: "hidden",
    },
    switchContainer: {
        backgroundColor: Colors.backgroundColor,
        padding: 16,
        borderRadius: Constants.rounding,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        height: 70,
        boxShadow: Constants.shadow,
    },
    switchOffOnText: {
        ...Styles.secondaryCenter,
        fontSize: 18,
        flex: 1,
    },
});

interface SettingsSectionProps {
    onExpand?: () => void;
    section: SettingsSection;
}

function SettingsSection(props: SettingsSectionProps) {
    const { width, height } = Dimensions.get("window");
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

    useEffect(() => {
        contentPosition.value = expanded ? "absolute" : "relative";
        contentWidth.value = withSpring(expanded ? width - 20 : width - 40);
        contentHeight.value = withSpring(expanded ? height - 60 : 50);
        contentBottom.value = withSpring(expanded ? -20 : 0);
        contentBgColor.value = withSpring(expanded ? Colors.backgroundPanelColorOpaque : "#ffffff00");
        contentBorderWidth.value = withSpring(expanded ? Constants.borderWidth : 0);
        contentZIndex.value = expanded ? 1 : 0;
    }, [expanded, width, height]);

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
                goBack();
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

    function itemTitle(title: string): string {
        return (t as any)["settings_" + title] || title;
    }

    return (
        <Animated.View style={[styles.content, contentStyle]} layout={Constants.layoutTransition}>
            {/* Button Mode */}
            {!expanded && (
                <Animated.View entering={CustomZoomIn} exiting={FadeOut}>
                    <TouchableOpacity style={styles.button} onPress={expand}>
                        {props.section.icon && <Icon name={props.section.icon} size={24} color="#fff" />}
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
                                    <Text style={styles.titleText}>{itemTitle(item.title)}</Text>

                                    {/* Box */}
                                    <View style={styles.languageSelectorContainer}>
                                        <Icon name="earth-americas" size={24} color={Colors.secondaryTextColor} />
                                        <Text style={[Styles.secondaryCenter, { fontSize: 18 }]}>{t.language_name}</Text>
                                        <View style={{ flex: 1 }} />
                                        <Pressable
                                            style={styles.languageSelectorPressable}
                                            android_ripple={Constants.rippleConfig}
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
                                            <Icon name="chevron-right" size={24} color={Colors.secondaryTextColor} />
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        } else if (item.type === "cache") {
                            component = (
                                <View>
                                    <Text style={styles.titleText}>{itemTitle(item.title)}</Text>
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
                                    <Text style={styles.titleText}>{itemTitle(item.title)}</Text>
                                    <View style={styles.switchContainer}>
                                        <Text style={styles.switchOffOnText}>Off</Text>
                                        <Switch
                                            checked={Storage.getBoolean(item.storageKey ?? "") ?? false}
                                            onChange={value => Storage.set(item.storageKey ?? "", value)}
                                        />
                                        <Text style={styles.switchOffOnText}>On</Text>
                                    </View>
                                </View>
                            );
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
                        <Icon name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );
}

export default SettingsSection;
