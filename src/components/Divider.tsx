import { Colors, Constants } from "@/Style";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    divider: {
        backgroundColor: Colors.borderColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth / 2,
        borderRadius: 999,
    },
});

function Divider() {
    return <View style={styles.divider} />;
}

export default Divider;
