import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { getShadow } from "@/Utils";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Keyboard, StyleSheet, TouchableOpacity, TouchableOpacityProps, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            width: "auto",
            height: "auto",
            position: "absolute",
            zIndex: 2,
        },
        view: {
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: getShadow(theme),
        },
        content: {
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
        },
    });

export interface PopupButtonProps extends TouchableOpacityProps {
    right?: number;
    bottom?: number;
    icon?: string;
    iconSize?: number;
}

export interface PopupButtonHandler {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const PopupButton = forwardRef<PopupButtonHandler, PopupButtonProps>((props, ref) => {
    const [isOpened, setIsOpened] = useState<boolean>(false);
    const { width: entireScreenWidth, height: entireScreenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
    const { right: rightProp, bottom: bottomProp, children, icon, iconSize, style, ...rest } = props;
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);
    const styles = useAppStyles(createStyles);

    useImperativeHandle(
        ref,
        () => ({
            open: () => setIsOpened(true),
            close: () => setIsOpened(false),
            toggle: () => setIsOpened(!isOpened),
        }),
        [],
    );

    // Animated styles
    const width = useSharedValue(100);
    const height = useSharedValue(100);
    const borderRadius = useSharedValue(50);
    const backgroundColor = useSharedValue(theme.backgroundPanelColor);
    const animatedContentStyle = useAnimatedStyle(() => ({
        width: withSpring(width.value),
        height: withSpring(height.value),
        borderRadius: withSpring(borderRadius.value),
        backgroundColor: withSpring(backgroundColor.value),
    }));

    const right = useSharedValue(rightProp || 0);
    const bottom = useSharedValue(bottomProp || 0);
    const animatedBoxStyle = useAnimatedStyle(() => ({
        right: withSpring(right.value),
        bottom: withSpring(bottom.value),
    }));

    const buttonStateOpacity = useSharedValue(1);
    const animatedButtonStateStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(buttonStateOpacity.value) }],
        opacity: withSpring(buttonStateOpacity.value),
    }));

    const popupStateOpacity = useSharedValue(0);
    const animatedPopupStateStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(popupStateOpacity.value) }],
        opacity: withSpring(popupStateOpacity.value),
    }));

    // Update styles
    useEffect(() => {
        const screenWidth = entireScreenWidth - insets.left - insets.right - Styles.container.paddingHorizontal * 2;
        const screenHeight =
            entireScreenHeight - insets.top - insets.bottom - Styles.container.paddingVertical * 2 - keyboardHeight;
        if (isOpened) {
            width.value = screenWidth;
            height.value = screenHeight;
            borderRadius.value = theme.rounding;
            backgroundColor.value = theme.backgroundPanelColorOpaque;
            right.value = -3;
            bottom.value = -4;
            buttonStateOpacity.value = 0;
            popupStateOpacity.value = 1;
        } else {
            width.value = 60;
            height.value = 60;
            borderRadius.value = 30;
            backgroundColor.value = theme.backgroundPanelColor;
            right.value = rightProp || 0;
            bottom.value = bottomProp || 0;
            buttonStateOpacity.value = 1;
            popupStateOpacity.value = 0;
        }
    }, [isOpened, entireScreenWidth, entireScreenHeight, insets, keyboardHeight, theme]);

    // Listen for keyboard changes
    useEffect(() => {
        const keyboardDidShowSub = Keyboard.addListener("keyboardDidShow", e => setKeyboardHeight(e.endCoordinates.height));
        const keyboardDidHideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => {
            keyboardDidShowSub.remove();
            keyboardDidHideSub.remove();
        };
    }, []);

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut} style={[styles.container, style, animatedBoxStyle]} {...rest}>
            <TouchableOpacity activeOpacity={1} onPress={() => setIsOpened(!isOpened)}>
                <Animated.View style={[styles.view, animatedContentStyle]}>
                    {/* Button state */}
                    <Animated.View style={[styles.content, animatedButtonStateStyle, { pointerEvents: "none" }]}>
                        <Icon name={icon || "plus"} color={theme.primaryTextColor} size={iconSize || 24} />
                    </Animated.View>

                    {/* Popup state */}
                    <Animated.View
                        style={[styles.content, animatedPopupStateStyle, { pointerEvents: isOpened ? "auto" : "none" }]}
                    >
                        {children}
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
});

export default PopupButton;
