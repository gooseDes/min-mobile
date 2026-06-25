import { Constants, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { StyleSheet, TouchableOpacityProps } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import Icon from "./Icon";
import PressableWithEffect from "./PressableWithEffect";

interface IconButtonProps extends TouchableOpacityProps {
    icon: string;
    onPress?: () => void;
    layoutTransition?: boolean;
}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        iconButton: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: theme.rounding,
        },
    });

function IconButton(props: IconButtonProps) {
    const { icon, onPress, layoutTransition, style, ...rest } = props;
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);

    return (
        <Animated.View layout={layoutTransition ? Constants.layoutTransition : undefined} entering={ZoomIn} exiting={ZoomOut}>
            <PressableWithEffect onPress={onPress} style={[styles.iconButton, style]} {...rest}>
                <Icon name={icon} size={24} color={theme.primaryTextColor} />
            </PressableWithEffect>
        </Animated.View>
    );
}

export default IconButton;
