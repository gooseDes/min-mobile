import { Constants } from "@/Style";
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import Icon from "./Icon";

interface IconButtonProps extends TouchableOpacityProps {
    icon: string;
    onPress?: () => void;
}

const styles = StyleSheet.create({
    iconButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
});

function IconButton(props: IconButtonProps) {
    const { icon, onPress, style, ...rest } = props;

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut}>
            <TouchableOpacity onPress={onPress} style={[styles.iconButton, style]} {...rest}>
                <Icon name={icon} size={24} color="#fff" />
            </TouchableOpacity>
        </Animated.View>
    );
}

export default IconButton;
