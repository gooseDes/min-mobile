import { createGlobalStyles, useAppStyles, useThemeStore } from "@/style";
import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, ZoomIn, ZoomOut } from "react-native-reanimated";
import { SpringConfig } from "react-native-reanimated/lib/typescript/animation/spring";
import PressableWithEffect from "./PressableWithEffect";

interface ClickableProfileProps extends ViewProps {
    text?: string;
    bottomText?: string;
    image?: string;
    onPress?: () => void;
    shown?: boolean;
    anim?: boolean;
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
    const { text, bottomText, image, onPress, anim = false, shown = true, ...rest } = props;
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);

    const translateX = useSharedValue<`${number}%` | number>(0);
    const opacity = useSharedValue<number>(1);

    const springConfig: SpringConfig = {
        velocity: 2,
        damping: 12,
        stiffness: 150,
        mass: 1,
    };

    useEffect(() => {
        if (!anim) return;
        translateX.value = "-50%";
        opacity.value = 0;
    }, []);

    useEffect(() => {
        if (!anim) return;
        translateX.value = withSpring(shown ? 0 : "-50%", springConfig);
        opacity.value = withTiming(shown ? 1 : 0, { duration: 400 });
    }, [shown, anim]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
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
                        <Image source={{ uri: image }} style={styles.image} />
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
