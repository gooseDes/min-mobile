import { Colors, Constants, Styles } from "@/Style";
import { StyleSheet, Text, TouchableOpacity, ViewProps } from "react-native";
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
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={[Styles.primaryText, styles.text]}>{text || "Button"}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default Button;
