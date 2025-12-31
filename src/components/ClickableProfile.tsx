import { Styles } from "@/Style";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming, ZoomIn, ZoomOut } from "react-native-reanimated";

interface ClickableProfileProps {
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
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
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
    const { text, bottomText, image, onPress, anim = "none", shown = true } = props;

    const animatedStyle = useAnimatedStyle(() => {
        if (anim === "none") return {};
        const springConfig = {
            damping: 12,
            stiffness: 150,
            mass: 1,
            overshootClamping: false,
        };
        return {
            opacity: withTiming(shown ? 1 : 0, { duration: 400 }),
            transform: [
                {
                    translateX: withSpring(shown ? 0 : anim === "left" ? "-50%" : "50%", springConfig),
                },
                {
                    translateY: withSpring(shown ? 0 : 100, springConfig),
                },
                { scale: withTiming(shown ? 1 : 0, { duration: 400 }) },
            ],
        };
    }, [shown]);

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <Animated.View style={animatedStyle}>
                <TouchableOpacity onPress={onPress}>
                    <View style={styles.container}>
                        <Image source={{ uri: image }} style={styles.image} /* Avatar */ />
                        <View style={styles.textContainer}>
                            {text && <Text style={Styles.primaryText}>{text}</Text> /* Name */}
                            {bottomText && <Text style={Styles.secondaryText}>{bottomText}</Text> /* Status */}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

export default ClickableProfile;
