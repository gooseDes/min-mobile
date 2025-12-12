import { StyleSheet, Text, View } from "react-native";
import { Colors, Constants, Styles } from "@/Style";

const styles = StyleSheet.create({
    messageContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
    },
    messageContent: {
        backgroundColor: Colors.messageBackgroundColor,
        padding: 10,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        borderTopRightRadius: 0,
        shadowColor: Colors.messageBackgroundColor,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        elevation: 1,
        textAlign: "left",
    },
});

function Message(props: React.PropsWithChildren) {
    return (
        <View style={styles.messageContainer}>
            <View style={styles.messageContent}>
                <Text style={Styles.primaryText}>{props.children}</Text>
            </View>
        </View>
    );
}

export default Message;
