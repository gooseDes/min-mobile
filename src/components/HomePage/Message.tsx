import Auth from "@/Auth";
import db from "@/db/Client";
import { messagesTable, usersTable } from "@/db/Schema";
import { getSocket } from "@/Socket";
import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { countChars, dateToString, getShadow } from "@/Utils";
import HapticPressable from "@components/HapticPressable";
import Icon from "@components/Icon";
import { useTranslation } from "@contexts/TranslationContext";
import FastImage from "@d11/react-native-fast-image";
import { SERVER } from "@env";
import { openDropdown } from "@services/DropdownService";
import { setMessagePrefix } from "@services/InputControlService";
import { setOverlayImage } from "@services/OverlayService";
import { eq } from "drizzle-orm";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ImageStyle, Pressable, StyleSheet, Text, useWindowDimensions, View, ViewProps } from "react-native";
import Markdown, { MarkedStyles, Renderer, RendererInterface } from "react-native-marked";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        messageContainer: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
        },
        messageContent: {
            backgroundColor: theme.messageBackgroundColor,
            paddingHorizontal: 10,
            paddingTop: 4,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.rounding,
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
        sentAtText: {
            fontSize: 11,
            marginBottom: 4,
            textAlign: "right",
        },
        dropdownTrigger: {
            flex: 1,
        },
    });

const markdownFlatListProps: any = {
    style: {
        backgroundColor: "transparent",
        marginTop: -4,
    },
};

function MarkdownImage({ uri, style }: { uri: string; style?: any }) {
    const [ratio, setRatio] = useState<number>(1);
    const { width: windowWidth } = useWindowDimensions();
    const [imageWidth, setImageWidth] = useState<number>(0);
    const [isImageVisible, setIsImageVisible] = useState<boolean>(true);
    const ref = useRef<View>(null);

    useEffect(() => {
        setImageWidth(ratio ? Math.min(windowWidth * 0.6, 250) : 0);
    }, [windowWidth, ratio]);

    return (
        <Pressable
            onPress={() => {
                if (ref.current) {
                    ref.current.measure((_x, _y, width, height, pageX, pageY) => {
                        setOverlayImage(
                            uri,
                            {
                                x: pageX,
                                y: pageY,
                                width,
                                height,
                            },
                            isShown => setIsImageVisible(!isShown),
                        );
                    });
                }
            }}
        >
            <View ref={ref} style={{ borderRadius: 8, overflow: "hidden", opacity: isImageVisible ? 1 : 0 }}>
                <FastImage
                    source={{ uri }}
                    style={[
                        {
                            width: imageWidth,
                            height: imageWidth / ratio,
                        },
                        style,
                    ]}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoad={e => {
                        const { width: imgWidth, height: imgHeight } = e.nativeEvent;
                        setRatio(imgWidth / imgHeight);
                    }}
                />
            </View>
        </Pressable>
    );
}

class MarkdownRenderer extends Renderer implements RendererInterface {
    image(uri: string, alt?: string, style?: ImageStyle): ReactNode {
        return <MarkdownImage key={this.getKey()} uri={uri} style={style} />;
    }
}

const markdownRenderer = new MarkdownRenderer();

interface MessageProps extends ViewProps {
    author_name?: string;
    author_id?: number;
    author_avatar?: string;
    side?: "left" | "right";
    show_avatar?: boolean;
    show_author?: boolean;
    shown?: boolean;
    sentAt?: Date;
    msg_id?: number;
    text?: string;
}

function withoutCommand(text: string): string {
    if (text.startsWith("/reply")) {
        const lines = text.split("\n");
        lines.shift();
        return lines.join("\n");
    }
    return text;
}

function MessageBase(props: MessageProps) {
    const isCurrentUser = props.author_name === Auth.username;
    const showAvatar = props.show_avatar === undefined ? true : props.show_avatar;
    const showAuthor = props.show_author === undefined ? true : props.show_author;
    const shown = props.shown === undefined ? true : props.shown;
    const side = props.side || "left";
    const { sentAt, msg_id } = props;

    const textStr = props.text?.toString() || "";
    const is_reply = textStr.startsWith("/reply");

    const { textWithoutCommand, marginTop } = useMemo(() => {
        const cleanText = withoutCommand(textStr);
        return {
            textWithoutCommand: cleanText,
            marginTop: calculateMargin(cleanText),
        };
    }, [textStr]);

    const [replyText, setReplyText] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    const { t } = useTranslation();
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    const markdownStyles = useMemo<MarkedStyles>(
        () => ({
            table: { borderWidth: theme.borderWidth, borderColor: theme.borderColor },
            blockquote: { marginTop: 8, ...Styles.primaryText },
            text: { ...Styles.primaryText },
            strong: { ...Styles.primaryBoldText },
            strikethrough: { ...Styles.primaryText },
            em: { ...Styles.primaryText },
            image: { borderRadius: theme.rounding - styles.messageContent.paddingHorizontal },
            li: { ...Styles.primaryText },
            h1: { ...Styles.primaryBoldText },
            h2: { ...Styles.primaryText },
            h3: { ...Styles.primaryText },
            h4: { ...Styles.primaryText },
            h5: { ...Styles.primaryText },
            h6: { ...Styles.primaryText },
        }),
        [theme, Styles, styles.messageContent.paddingHorizontal],
    );

    async function getReplyText() {
        const replyId = parseInt(textStr.split("\n")[0].split(" ")[1], 10);
        const socket = await getSocket();
        socket.on("requestedMessage", (msgData: any) => {
            socket.on("userInfo", (userData: any) => {
                setReplyText(`${userData.user.name}: ${msgData.message.content}`);
                socket.off("userInfo");
            });
            socket.emit("getUserInfo", { msg_id: msgData.message.sender_id });
            socket.off("requestedMessage");
        });
        const replyMessage = await db.query.messagesTable.findFirst({ where: eq(messagesTable.id, replyId) });
        if (replyMessage) {
            const sender = await db.query.usersTable.findFirst({ where: eq(usersTable.id, replyMessage.senderId) });
            setReplyText(`${sender?.username || replyMessage.senderId}: ${withoutCommand(replyMessage.content || "")}`);
        } else {
            socket.emit("getMessage", { messageId: replyId });
        }
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

    async function deleteMessage() {
        const socket = await getSocket();
        socket.emit("deleteMessage", { message: msg_id });
    }

    function calculateMargin(md: string) {
        let margin = -8;
        function changeMargin(newMargin: number) {
            if (newMargin > margin) {
                margin = newMargin;
            }
        }

        md = md.trim();

        if (md.includes(">") && !md.includes("\\>")) {
            changeMargin(0);
        }

        const lastLine = md.split("\n").at(-1) || "";
        if (lastLine.includes("# ") && !lastLine.includes("\\# ")) {
            changeMargin(0);
        } else if (lastLine.startsWith("- ") || lastLine.startsWith("* ") || lastLine.startsWith("+ ")) {
            changeMargin(0);
        } else if (lastLine.startsWith("![") && !lastLine.includes("\\![")) {
            changeMargin(0);
        }
        if (countChars(lastLine, "`") >= 2) {
            changeMargin(-4);
        }
        return margin;
    }

    return (
        <Animated.View
            style={[styles.messageContainer, props.side === "left" ? styles.leftSide : styles.rightSide, animatedStyle]}
        >
            {showAvatar && (
                <FastImage source={{ uri: `${SERVER}/avatars/${props.author_avatar || ""}.webp` }} style={styles.avatar} />
            )}
            <View style={{ display: "flex", flexDirection: props.side === "left" ? "row" : "row-reverse" }}>
                <Animated.View
                    style={[
                        styles.messageContent,
                        props.side === "left" ? styles.leftSideContent : styles.rightSideContent,
                        {
                            transition: "boxShadow 0.3s ease-in-out, transform 0.3s ease-in-out",
                            boxShadow: dropdownOpen ? `0px 0px 8px ${theme.secondaryTextColor}` : getShadow(theme),
                            transform: [
                                { scale: dropdownOpen ? 1.1 : 1 },
                                { translateX: dropdownOpen ? (side === "left" ? 16 : -16) : 0 },
                            ],
                        },
                    ]}
                >
                    {props.author_name && showAuthor && (
                        <Text style={[Styles.secondaryText, styles.authorText]}>
                            {isCurrentUser ? t.you : props.author_name}
                        </Text>
                    )}
                    {is_reply && replyText && (
                        <Text numberOfLines={1} ellipsizeMode="tail" style={[Styles.secondaryText, styles.replyText]}>
                            <Icon name="reply" size={10} /> {replyText}
                        </Text>
                    )}

                    <Markdown
                        renderer={markdownRenderer || undefined}
                        styles={markdownStyles}
                        flatListProps={markdownFlatListProps}
                        value={textWithoutCommand}
                    />

                    {sentAt && (
                        <Text style={[Styles.secondaryText, styles.sentAtText, { marginTop: marginTop }]}>
                            {dateToString(sentAt)}
                        </Text>
                    )}
                </Animated.View>
                <HapticPressable
                    style={styles.dropdownTrigger}
                    onPress={e => {
                        setDropdownOpen(true);
                        openDropdown(
                            e.nativeEvent.pageX,
                            e.nativeEvent.pageY,
                            [
                                { icon: "reply", text: t.reply, onPress: () => setMessagePrefix(`/reply ${msg_id}\n`) },
                                { icon: "trash", text: t.delete, onPress: deleteMessage },
                            ],
                            () => setDropdownOpen(false),
                        );
                    }}
                />
            </View>
        </Animated.View>
    );
}

const Message = React.memo(MessageBase);

export default Message;
