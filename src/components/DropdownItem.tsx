import { Colors, Constants, Styles } from "@/Style";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Icon from "./Icon";

export interface DropdownItemProps {
    text?: string;
    icon?: string;
    onClick?: () => void;
}

const styles = StyleSheet.create({
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
        borderRadius: Constants.rounding - 8,
    },
    text: {
        fontSize: 24,
    },
});

function DropdownItem(props: DropdownItemProps) {
    const { text, icon } = props;

    const scale = useSharedValue(1);
    const backgroundColor = useSharedValue("#ffffff00");

    const containerAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: backgroundColor.value,
        };
    });

    const labelAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <Pressable
            style={styles.touchable}
            onPress={props.onClick}
            onPressIn={() => {
                scale.value = withSpring(0.8, { velocity: 2, damping: 50 });
                backgroundColor.value = withSpring("#ffffff30");
            }}
            onPressOut={() => {
                scale.value = withSpring(1, { velocity: 2, damping: 50 });
                backgroundColor.value = withSpring("#ffffff00");
            }}
        >
            <Animated.View style={[styles.container, containerAnimatedStyle]}>
                <Animated.View style={[styles.labelContainer, labelAnimatedStyle]}>
                    {icon && <Icon color={Colors.primaryTextColor} name={icon} size={styles.text.fontSize * 0.75} />}
                    {text && <Text style={[Styles.primaryText, styles.text]}>{text}</Text>}
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

export default DropdownItem;
