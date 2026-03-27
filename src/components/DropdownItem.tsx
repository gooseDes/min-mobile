import { Styles } from "@/Style";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    text: {
        fontSize: 24,
    },
});

function DropdownItem(props: DropdownItemProps) {
    const { text } = props;

    return (
        <TouchableOpacity style={styles.touchable} onPress={props.onClick}>
            <View>{text && <Text style={[Styles.primaryText, styles.text]}>{text}</Text>}</View>
        </TouchableOpacity>
    );
}

export default DropdownItem;
