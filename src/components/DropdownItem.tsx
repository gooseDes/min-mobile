import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import Icon from "./Icon";
import PressableWithEffect from "./PressableWithEffect";

export interface DropdownItemProps {
    text?: string;
    icon?: string;
    onClick?: () => void;
}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        touchable: {
            width: "100%",
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        labelContainer: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        container: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.rounding - 8,
        },
        text: {
            fontSize: 24,
        },
    });

function DropdownItem(props: DropdownItemProps) {
    const { text, icon } = props;

    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <PressableWithEffect style={styles.touchable} onPress={props.onClick}>
            <Animated.View style={styles.container}>
                <Animated.View style={styles.labelContainer}>
                    {icon && <Icon color={theme.primaryTextColor} name={icon} size={styles.text.fontSize * 0.75} />}
                    {text && <Text style={[Styles.primaryText, styles.text]}>{text}</Text>}
                </Animated.View>
            </Animated.View>
        </PressableWithEffect>
    );
}

export default DropdownItem;
