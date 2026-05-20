import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { StyleSheet, Text } from "react-native";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import Icon from "./Icon";
import PressableWithEffect from "./PressableWithEffect";
import SurelyAnimatedView from "./SurelyAnimatedView";

interface FloatIslandButtonProps {
    icon: string;
    text?: string;
    onPress?: () => void;
}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 10,
            justifyContent: "center",
            alignItems: "center",
        },
        touchable: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            aspectRatio: 1,
            transform: [{ translateY: 2 }],
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
        <SurelyAnimatedView layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} style={styles.container}>
            <PressableWithEffect onPress={onPress} style={styles.touchable}>
                <Icon name={icon} size={16} color={theme.primaryTextColor} />
                <Text style={[Styles.primaryText, styles.text, { fontSize: 12 }]} numberOfLines={1}>
                    {text}
                </Text>
            </PressableWithEffect>
        </SurelyAnimatedView>
    );
};

export default FloatIslandButton;
