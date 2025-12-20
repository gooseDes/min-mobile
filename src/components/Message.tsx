import { Image, StyleSheet } from "react-native";
import { Colors, Constants, Styles } from "@/Style";
import Auth from "@/Auth";
import { SERVER } from "@env";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { t } from "@/Translation";
import React from "react";

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

function Message(props: MessageProps) {
    const isCurrentUser = props.author_name === Auth.username;
    const showAvatar = props.show_avatar === undefined ? true : props.show_avatar;
    const showAuthor = props.show_author === undefined ? true : props.show_author;
    const shown = props.shown === undefined ? true : props.shown;

    const animatedStyle = useAnimatedStyle(() => {
        const springConfig = {
            damping: 12,
            stiffness: 150,
            mass: 1,
            overshootClamping: false,
        };
        return {
            opacity: withTiming(shown ? 1 : 0, { duration: 400 }),
            transform: [
                {
                    translateX: withSpring(shown ? 0 : props.side === "left" ? "-100%" : "100%", springConfig),
                },
                {
                    translateY: withSpring(shown ? 0 : 100, springConfig),
                },
                { scale: withTiming(shown ? 1 : 0, { duration: 400 }) },
            ],
        };
    }, [shown]);

    return (
        <Animated.View
            style={[styles.messageContainer, props.side === "left" ? styles.leftSide : styles.rightSide, animatedStyle]}
        >
            {showAvatar && <Image source={{ uri: `${SERVER}/avatars/${props.author_id || ""}.webp` }} style={styles.avatar} />}
            <Animated.View
                style={[styles.messageContent, props.side === "left" ? styles.leftSideContent : styles.rightSideContent]}
            >
                {props.author_name && showAuthor && (
                    <Animated.Text style={[Styles.secondaryText, styles.authorText, { textAlign: props.side || "left" }]}>
                        {isCurrentUser ? t.you : props.author_name}
                    </Animated.Text>
                )}
                <Animated.Text selectable={true} style={[Styles.primaryText, { textAlign: props.side || "left" }]}>
                    {props.children}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
}

export default Message;
