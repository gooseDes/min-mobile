import { Styles } from "@/Style";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

interface ClickableProfileProps {
    text?: string;
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
});

function ClickableProfile(props: ClickableProfileProps) {
    const { text, image, onPress } = props;
    const shown = props.shown === undefined ? true : props.shown;
    const anim = props.anim === undefined ? "none" : props.anim;

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
        <Animated.View style={animatedStyle}>
            <TouchableOpacity onPress={onPress}>
                <View style={styles.container}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <Text style={Styles.primaryText}>{text}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default ClickableProfile;
