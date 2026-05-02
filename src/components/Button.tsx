import { Constants, createGlobalStyles, ThemeData, useAppStyles } from "@/Style";
import { GestureResponderEvent, Pressable, StyleSheet, Text, ViewProps } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        button: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            backgroundColor: theme.backgroundPanelColor,
            borderRadius: Constants.rounding,
            borderWidth: Constants.borderWidth,
            borderColor: theme.borderColor,
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
    onPress?: (event: GestureResponderEvent) => void;
}

function Button(props: ButtonProps) {
    const { text, onPress, ...rest } = props;
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} {...rest}>
            <Pressable style={styles.button} onPress={onPress} android_ripple={Constants.rippleConfig}>
                <Text style={[Styles.primaryText, styles.text]}>{text || "Button"}</Text>
            </Pressable>
        </Animated.View>
    );
}

export default Button;
