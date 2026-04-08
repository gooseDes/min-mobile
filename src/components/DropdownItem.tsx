import { Colors, Styles } from "@/Style";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    container: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    text: {
        fontSize: 24,
    },
});

function DropdownItem(props: DropdownItemProps) {
    const { text, icon } = props;

    return (
        <TouchableOpacity style={styles.touchable} onPress={props.onClick}>
            <View style={styles.container}>
                {icon && <Icon color={Colors.primaryTextColor} name={icon} size={styles.text.fontSize * 0.75} />}
                {text && <Text style={[Styles.primaryText, styles.text]}>{text}</Text>}
            </View>
        </TouchableOpacity>
    );
}

export default DropdownItem;
