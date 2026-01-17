import { Colors, Constants } from "@/Style";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    divider: {
        backgroundColor: Colors.borderColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth / 2,
        borderRadius: 999,
        width: "100%",
    },
});

interface DividerProps {
    style?: any;
}

function Divider(props: DividerProps) {
    return <View style={[styles.divider, props.style]} />;
}

export default Divider;
