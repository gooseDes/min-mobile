import { Image, StyleSheet, Text, View } from "react-native";
import { Colors, Constants, Styles } from "@/Style";
import Auth from "@/Auth";
import { SERVER } from "@env";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { t } from "@/Translation";
import React, { useEffect } from "react";

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
        maxWidth: "80%",
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
    show_author?: boolean;
    shown?: boolean;
}

function MessageBase(props: MessageProps) {
    const isCurrentUser = props.author_name === Auth.username;
    const showAvatar = props.show_avatar === undefined ? true : props.show_avatar;
    const showAuthor = props.show_author === undefined ? true : props.show_author;
    const shown = props.shown === undefined ? true : props.shown;
    const side = props.side || "left";

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
                    <Text style={[Styles.secondaryText, styles.authorText, { textAlign: props.side || "left" }]}>
                        {isCurrentUser ? t.you : props.author_name}
                    </Text>
                )}
                <Text selectable={true} style={[Styles.primaryText, { textAlign: props.side || "left" }]}>
                    {props.children}
                </Text>
            </View>
        </Animated.View>
    );
}

const Message = React.memo(MessageBase);

export default Message;
