import { Colors, Constants, Styles } from "@/Style";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

const styles = StyleSheet.create({
    button: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: Colors.backgroundPanelColor,
        borderRadius: Constants.rounding,
        borderWidth: Constants.borderWidth,
        borderColor: Colors.borderColor,
    },
    text: {
        textAlign: "center",
        fontSize: 16,
    },
});

interface ButtonProps extends TouchableOpacityProps {
    text?: string;
}

function Button(props: ButtonProps) {
    const { text, ...rest } = props;
    return (
        <TouchableOpacity {...rest} style={styles.button}>
            <Text style={[Styles.primaryText, styles.text]}>{text || "Button"}</Text>
        </TouchableOpacity>
    );
}

export default Button;
