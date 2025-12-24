import { Colors, Constants, Styles } from "@/Style";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundPanelColor,
        width: "80%",
        maxWidth: 600,
        height: 64,
        borderRadius: 999,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        transformOrigin: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    text: {
        fontSize: 14,
    },
});

export interface NotificationHandle {
    setText: (newText: string) => void;
    setTitle: (newTitle: string) => void;
    show: () => void;
}

export interface NotificationProps {
    title?: string;
    text?: string;
}

const Notification = forwardRef<NotificationHandle, NotificationProps>((props, ref) => {
    const insets = useSafeAreaInsets();
    const [shown, setShown] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(props.title || "");
    const [text, setText] = useState<string>(props.text || "");
    const closeTimeout = useRef<number | null>(null);
    const { width } = useWindowDimensions();

    useImperativeHandle(ref, () => ({
        setTitle: (newTitle: string) => {
            setTitle(newTitle);
        },
        setText: (newText: string) => {
            setText(newText);
        },
        show: () => {
            setShown(true);
            if (closeTimeout.current) {
                clearTimeout(closeTimeout.current);
            }
            closeTimeout.current = setTimeout(() => {
                setShown(false);
            }, 5000);
        },
    }));

    const top = useSharedValue<number>(0);
    const scale = useSharedValue<number>(0);
    const left = useSharedValue<number>(width / 2 - width * 0.4);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            top: top.value,
            left: left.value,
            transform: [{ scale: scale.value }],
        };
    });

    useEffect(() => {
        top.value = withSpring(shown ? insets.top : -60, { damping: 12, stiffness: 150, mass: 1 });
        scale.value = withSpring(shown ? 1 : 0);
    }, [insets, shown]);

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Text style={[styles.title, Styles.primaryText]}>{title}</Text>
            <Text style={[styles.text, Styles.secondaryText]}>{text}</Text>
        </Animated.View>
    );
});

export default Notification;
