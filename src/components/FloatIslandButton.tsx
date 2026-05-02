import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import Icon from "./Icon";

interface FloatIslandButtonProps {
    icon: string;
    text?: string;
    onPress?: () => void;
}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 10,
        },
        touchable: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        text: {
            color: theme.primaryTextColor,
        },
    });

const FloatIslandButton = ({ icon, text, onPress }: FloatIslandButtonProps) => {
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} style={styles.container}>
            <TouchableOpacity onPress={onPress} style={styles.touchable}>
                <Icon name={icon} size={16} color={theme.primaryTextColor} />
                <Text style={[Styles.primaryText, styles.text]}>{text}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default FloatIslandButton;
