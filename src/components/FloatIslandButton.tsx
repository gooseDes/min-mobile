import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { Colors, Constants, Styles } from "@/Style";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "./Icon";

interface FloatIslandButtonProps {
    icon: string;
    text?: string;
    onPress?: () => void;
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
    },
    touchable: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: Colors.primaryTextColor,
    },
});

const FloatIslandButton = ({ icon, text, onPress }: FloatIslandButtonProps) => {
    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} style={styles.container}>
            <TouchableOpacity onPress={onPress} style={styles.touchable}>
                <Icon name={icon} size={16} color={Colors.primaryTextColor} />
                <Text style={[Styles.primaryText, styles.text]}>{text}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default FloatIslandButton;
