import { Constants, useThemeStore } from "@/Style";
import { Pressable, StyleSheet, TouchableOpacityProps } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import Icon from "./Icon";

interface IconButtonProps extends TouchableOpacityProps {
    icon: string;
    onPress?: () => void;
    layoutTransition?: boolean;
}

const styles = StyleSheet.create({
    iconButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
});

function IconButton(props: IconButtonProps) {
    const { icon, onPress, layoutTransition, style, ...rest } = props;
    const theme = useThemeStore(s => s.theme);

    return (
        <Animated.View layout={layoutTransition ? Constants.layoutTransition : undefined} entering={ZoomIn} exiting={ZoomOut}>
            <Pressable onPress={onPress} style={[styles.iconButton, style]} android_ripple={Constants.rippleConfig} {...rest}>
                <Icon name={icon} size={24} color={theme.primaryTextColor} />
            </Pressable>
        </Animated.View>
    );
}

export default IconButton;
