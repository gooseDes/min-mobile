import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Divider from "./Divider";
import PressableWithEffect from "./PressableWithEffect";

export interface PopupHandler {
    show: () => void;
    hide: () => void;
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setButtons: (buttons: PopupButton[]) => void;
    setOnClose: (onClose: () => void) => void;
}

export interface PopupProps {}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        popup: {
            backgroundColor: theme.backgroundColor,
            borderRadius: theme.rounding,
            width: "80%",
            height: "auto",
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        buttonContainer: {
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexDirection: "row",
        },
        pressable: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 8,
        },
    });

const Popup = forwardRef<PopupHandler, PopupProps>((props, ref) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("Popup");
    const [content, setContent] = useState<string>("Content");
    const [buttons, setButtons] = useState<PopupButton[]>([]);
    const onClose = useRef<() => void>(() => {});
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);
    const styles = useAppStyles(createStyles);

    useImperativeHandle(ref, () => ({
        show: () => setVisible(true),
        hide: () => setVisible(false),
        setTitle: (newTitle: string) => setTitle(newTitle),
        setContent: (newContent: string) => setContent(newContent),
        setButtons: (newButtons: PopupButton[]) => {
            setButtons(newButtons);
        },
        setOnClose: (newOnClose: () => void) => {
            onClose.current = newOnClose;
        },
    }));

    useEffect(() => {
        opacity.value = withSpring(visible ? 1 : 0);
        scale.value = withSpring(visible ? 1 : 2);
        blur.value = withSpring(visible ? 0 : 8, {}, completed => {
            if (completed) {
                shadowColor.value = withSpring(visible ? theme.shadowColor : "rgba(0, 0, 0, 0)");
            }
        });
    }, [visible]);

    const opacity = useSharedValue<number>(1);
    const scale = useSharedValue<number>(3);
    const blur = useSharedValue<number>(8);
    const shadowColor = useSharedValue<string>("rgba(0, 0, 0, 0)");

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
        filter: [{ blur: blur.value }],
        boxShadow: [
            {
                color: shadowColor.value,
                offsetX: theme.shadowOffsetX,
                offsetY: theme.shadowOffsetY,
                inset: theme.shadowInset,
                spreadDistance: theme.shadowSpread,
                blurRadius: theme.shadowBlur,
            },
        ],
    }));

    return (
        <View collapsable={false} style={[styles.container, { pointerEvents: visible ? "auto" : "none" }]}>
            <Animated.View style={[styles.popup, animatedStyle]}>
                <Text style={[Styles.primaryBoldText, { textAlign: "center", fontSize: 24 }]}>{title}</Text>
                <Divider style={{ marginVertical: 8 }} />
                <Text style={[Styles.primaryText, { fontSize: 16 }]}>{content}</Text>
                <Divider style={{ marginVertical: 8 }} />
                <View style={styles.buttonContainer}>
                    {buttons.map((button, index) => (
                        <PressableWithEffect
                            key={index}
                            style={styles.pressable}
                            onPress={() => {
                                button.onPress?.();
                                setVisible(false);
                                onClose.current?.();
                            }}
                        >
                            <Text style={[Styles.primaryText, { fontSize: 16 }]}>{button.text}</Text>
                        </PressableWithEffect>
                    ))}
                </View>
            </Animated.View>
        </View>
    );
});

export default Popup;
