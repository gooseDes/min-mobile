import { Image, StyleSheet, Text, View } from "react-native";
import { Colors, Constants, Styles } from "@/Style";
import Auth from "@/Auth";
import { SERVER } from "@env";

const styles = StyleSheet.create({
    messageContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
    },
    messageContent: {
        backgroundColor: Colors.messageBackgroundColor,
        padding: 10,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        shadowColor: Colors.messageBackgroundColor,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        elevation: 1,
    },
    authorText: {
        fontSize: 12,
    },
    leftSide: {
        alignItems: "flex-start",
    },
    rightSide: {
        alignItems: "flex-end",
    },
    leftSideContent: {
        borderTopLeftRadius: 0,
    },
    rightSideContent: {
        borderTopRightRadius: 0,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: 5,
    },
});

interface MessageProps extends React.PropsWithChildren {
    author_name?: string;
    author_id?: number;
    side?: "left" | "right";
    show_avatar?: boolean;
}

function Message(props: MessageProps) {
    const isCurrentUser = props.author_name === Auth.username;
    const showAvatar = props.show_avatar === undefined ? true : props.show_avatar;

    return (
        <View style={[styles.messageContainer, props.side === "left" ? styles.leftSide : styles.rightSide]}>
            {showAvatar && <Image source={{ uri: `${SERVER}/avatars/${props.author_id || ""}.webp` }} style={styles.avatar} />}
            <View style={[styles.messageContent, props.side === "left" ? styles.leftSideContent : styles.rightSideContent]}>
                {props.author_name && (
                    <Text style={[Styles.secondaryText, styles.authorText, { textAlign: props.side || "left" }]}>
                        {isCurrentUser ? "You" : props.author_name}
                    </Text>
                )}
                <Text style={[Styles.primaryText, { textAlign: props.side || "left" }]}>{props.children}</Text>
            </View>
        </View>
    );
}

export default Message;
