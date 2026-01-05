import Auth from "@/Auth";
import { getSocket } from "@/Socket";
import { Colors, Constants, Styles } from "@/Style";
import { t } from "@/Translation";
import { SERVER } from "@env";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Markdown, { MarkedStyles } from "react-native-marked";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import Icon from "./Icon";

const styles = StyleSheet.create({
    messageContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
    },
    messageContent: {
        backgroundColor: Colors.messageBackgroundColor,
        paddingHorizontal: 10,
        paddingTop: 4,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        maxWidth: "80%",
    },
    authorText: {
        fontSize: 13,
        marginBottom: -6,
    },
    replyText: {
        fontSize: 11,
        marginBottom: -4,
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

const markdownStyles: MarkedStyles = {
    table: { borderWidth: Constants.borderWidth, borderColor: Colors.borderColor },
    blockquote: { marginVertical: 8 },
};

const markdownFlatListProps: any = {
    style: {
        backgroundColor: "transparent",
        marginTop: -4,
    },
};

interface MessageProps extends React.PropsWithChildren {
    author_name?: string;
    author_id?: number;
    side?: "left" | "right";
    show_avatar?: boolean;
    show_author?: boolean;
    shown?: boolean;
}

function MessageBase(props: MessageProps) {
    const isCurrentUser = props.author_name === Auth.username;
    const showAvatar = props.show_avatar === undefined ? true : props.show_avatar;
    const showAuthor = props.show_author === undefined ? true : props.show_author;
    const shown = props.shown === undefined ? true : props.shown;
    const side = props.side || "left";

    const text = props.children?.toString() || "";
    const is_reply = text.startsWith("/reply");
    const [replyText, setReplyText] = useState<string>("");

    async function getReplyText() {
        const replyId = parseInt(text.split("\n")[0].split(" ")[1], 10);
        const socket = await getSocket();
        socket.on("requestedMessage", (msgData: any) => {
            socket.on("userInfo", (userData: any) => {
                setReplyText(`${userData.user.name}: ${msgData.message.content}`);
                socket.off("userInfo");
            });
            socket.emit("getUserInfo", { id: msgData.message.sender_id });
            socket.off("requestedMessage");
        });
        socket.emit("getMessage", { messageId: replyId });
    }

    useEffect(() => {
        if (is_reply) getReplyText();
    }, [is_reply]);

    const opacity = useSharedValue(shown ? 1 : 0);
    const translateX = useSharedValue(shown ? 0 : side === "left" ? -100 : 100);
    const translateY = useSharedValue(shown ? 0 : 100);
    const scale = useSharedValue(shown ? 1 : 0);

    useEffect(() => {
        opacity.value = withTiming(shown ? 1 : 0, { duration: 400 });
        translateX.value = withSpring(shown ? 0 : side === "left" ? -100 : 100, { damping: 12, stiffness: 150, mass: 1 });
        translateY.value = withSpring(shown ? 0 : 100, { damping: 12, stiffness: 150, mass: 1 });
        scale.value = withTiming(shown ? 1 : 0, { duration: 400 });
    }, [shown, side]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[styles.messageContainer, props.side === "left" ? styles.leftSide : styles.rightSide, animatedStyle]}
        >
            {showAvatar && <Image source={{ uri: `${SERVER}/avatars/${props.author_id || ""}.webp` }} style={styles.avatar} />}
            <View style={[styles.messageContent, props.side === "left" ? styles.leftSideContent : styles.rightSideContent]}>
                {props.author_name && showAuthor && (
                    <Text style={[Styles.secondaryText, styles.authorText]}>{isCurrentUser ? t.you : props.author_name}</Text>
                )}
                {is_reply && replyText && (
                    <Text style={[Styles.secondaryText, styles.replyText]}>
                        <Icon name="reply" size={10} /> {replyText}
                    </Text>
                )}

                <Markdown
                    styles={markdownStyles}
                    flatListProps={markdownFlatListProps}
                    value={is_reply ? text.replace(/^.*\n/, "") : text}
                />
            </View>
        </Animated.View>
    );
}

const Message = React.memo(MessageBase);

export default Message;
