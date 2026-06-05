import { createGlobalStyles, useAppStyles, useThemeStore } from "@/Style";
import FastImage from "@d11/react-native-fast-image";
import { useEffect } from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomIn, ZoomOut } from "react-native-reanimated";
import PressableWithEffect from "./PressableWithEffect";

interface ClickableProfileProps extends ViewProps {
    text?: string;
    bottomText?: string;
    image?: string;
    onPress?: () => void;
    shown?: boolean;
    anim?: "none" | "left" | "right";
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        aspectRatio: 1,
    },
    textContainer: {
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
        height: 20,
    },
});

function ClickableProfile(props: ClickableProfileProps) {
    const { text, bottomText, image, onPress, anim = "none", shown = true, ...rest } = props;
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);

    const translateX = useSharedValue<`${number}%` | number>(0);
    const translateY = useSharedValue<`${number}%` | number>(0);
    const scale = useSharedValue<number>(1);
    const opacity = useSharedValue<number>(1);

    const springConfig = {
        damping: 12,
        stiffness: 150,
        mass: 1,
        overshootClamping: false,
    };

    useEffect(() => {
        if (anim === "none") return;
        translateX.value = anim === "left" ? "-50%" : "50%";
        translateY.value = anim === "left" ? "-50%" : "50%";
        scale.value = 0;
        opacity.value = 0;
    }, []);

    useEffect(() => {
        if (anim === "none") return;
        translateX.value = withSpring(shown ? 0 : anim === "left" ? "-50%" : "50%", springConfig);
        translateY.value = withSpring(shown ? 0 : anim === "left" ? "-50%" : "50%", springConfig);
        scale.value = withTiming(shown ? 1 : 0, { duration: 400 });
        opacity.value = withTiming(shown ? 1 : 0, { duration: 400 });
    }, [shown, anim]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    }));

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <Animated.View style={[animatedStyle, rest.style]}>
                <PressableWithEffect
                    scaleWhenPressed={1}
                    onPress={onPress}
                    style={{ borderRadius: theme.rounding, flex: 1, padding: 8 }}
                >
                    <View style={styles.container}>
                        <FastImage source={{ uri: image }} style={styles.image} />
                        <View style={styles.textContainer}>
                            {text && <Text style={Styles.primaryText}>{text}</Text> /* Name */}
                            {bottomText && <Text style={Styles.secondaryText}>{bottomText}</Text> /* Status */}
                        </View>
                        <View style={{ flex: 1 }} />
                    </View>
                </PressableWithEffect>
            </Animated.View>
        </Animated.View>
    );
}

export default ClickableProfile;
