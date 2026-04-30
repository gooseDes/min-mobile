import { Colors, Constants, Styles } from "@/Style";
import { Pressable, StyleSheet, Text, ViewProps } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

const styles = StyleSheet.create({
    button: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: Colors.backgroundPanelColor,
        borderRadius: Constants.rounding,
        borderWidth: Constants.borderWidth,
        borderColor: Colors.borderColor,
        paddingHorizontal: 10,
        boxShadow: Constants.shadow,
        overflow: "hidden",
    },
    text: {
        textAlign: "center",
        fontSize: 16,
    },
});

interface ButtonProps extends ViewProps {
    text?: string;
    onPress?: () => void;
}

function Button(props: ButtonProps) {
    const { text, onPress, ...rest } = props;

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} {...rest}>
            <Pressable style={styles.button} onPress={onPress} android_ripple={Constants.rippleConfig}>
                <Text style={[Styles.primaryText, styles.text]}>{text || "Button"}</Text>
            </Pressable>
        </Animated.View>
    );
}

export default Button;
