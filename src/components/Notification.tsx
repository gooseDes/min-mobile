import { createGlobalStyles, ThemeData, useAppStyles } from "@/Style";
import { getShadow } from "@/Utils";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.backgroundPanelColor,
            width: "80%",
            maxWidth: 600,
            height: 64,
            borderRadius: 999,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            zIndex: 9999,
            transformOrigin: "center",
            padding: 8,
            gap: 16,
            boxShadow: getShadow(theme),
        },
        title: {
            fontSize: 16,
            fontWeight: "bold",
        },
        text: {
            fontSize: 14,
        },
        image: {
            aspectRatio: 1,
            height: "100%",
            borderRadius: 999,
        },
    });

export interface NotificationHandle {
    setText: (newText: string) => void;
    setTitle: (newTitle: string) => void;
    setImage: (newImage: string | null) => void;
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
    const [image, setImage] = useState<string | null>(null);
    const closeTimeout = useRef<number | null>(null);
    const { width } = useWindowDimensions();
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    useImperativeHandle(ref, () => ({
        setTitle: (newTitle: string) => {
            setTitle(newTitle);
        },
        setText: (newText: string) => {
            setText(newText);
        },
        setImage: (newImage: string | null) => {
            setImage(newImage);
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
    const [textWidth, setTextWidth] = useState<number>(width * 0.8 - 16);

    useEffect(() => {
        setTextWidth(width * 0.5);
    }, [width]);

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
            {image && <Image source={{ uri: image }} style={styles.image as any} />}
            <View style={{ marginLeft: image ? 0 : 16 }}>
                <Text style={[styles.title, Styles.primaryText]}>{title}</Text>
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.text, Styles.secondaryText, { width: textWidth + (image ? 0 : 48) }]}
                >
                    {text}
                </Text>
            </View>
        </Animated.View>
    );
});

export default Notification;
