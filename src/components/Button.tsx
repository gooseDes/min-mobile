import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { getShadow } from "@/utils";
import { GestureResponderEvent, StyleSheet, Text, ViewProps } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import HapticPressable from "./HapticPressable";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        button: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            backgroundColor: theme.backgroundPanelColor,
            borderRadius: theme.rounding,
            borderWidth: theme.borderWidth,
            borderColor: theme.borderColor,
            paddingHorizontal: 10,
            boxShadow: getShadow(theme),
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

    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} {...rest}>
            <HapticPressable
                style={styles.button}
                onPress={onPress}
                android_ripple={{ color: theme.rippleColor, foreground: true }}
            >
                <Text style={[Styles.primaryText, styles.text]}>{text || "Button"}</Text>
            </HapticPressable>
        </Animated.View>
    );
}

export default Button;
