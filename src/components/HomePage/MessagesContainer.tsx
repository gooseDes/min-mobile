import { useStorage } from "@/storage";
import { Constants } from "@/style";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import Message from "./Message";

const styles = StyleSheet.create({
    messagesContainer: {
        flex: 1,
        width: "100%",
        display: "flex",
    },
    contentContainerStyle: {
        padding: 4,
    },
});

export interface MessagesContainerHandle {
    setMessages: (newMessages: MessageData[]) => void;
    addMessage: (message: MessageData) => void;
    deleteMessage: (messageId: number) => void;
    changeMessageNumberBy: (amount: number) => void;
    show: () => void;
    hide: () => void;
}

export interface MessagesContainerProps {
    topGap: number;
    bottomGap: number;
    disabled?: boolean;
}

const splitter = () => {
    return <View style={{ height: 10 }} />;
};

const MessagesContainer = React.memo(
    forwardRef<MessagesContainerHandle, MessagesContainerProps>((props, ref) => {
        const { bottomGap, topGap, disabled } = props;
        const messagesRef = useRef<MessageData[]>([]);
        const [animProgress, setAnimProgress] = useState<number>(0);
        const [newlyAddedMessages, setNewlyAddedMessages] = useState<number>(0);
        const [userId] = useStorage<number>("user.id", -1);

        const reversedMessages = useMemo(() => {
            return [...messagesRef.current].reverse();
        }, [animProgress]);

        useImperativeHandle(ref, () => ({
            setMessages: (newMessages: MessageData[]) => {
                messagesRef.current = newMessages;
            },
            addMessage: (message: MessageData) => {
                messagesRef.current.push(message);
                setAnimProgress(messagesRef.current.length);
            },
            deleteMessage: (messageId: number) => {
                messagesRef.current = messagesRef.current.filter(msg => msg.id !== messageId);
                setAnimProgress(messagesRef.current.length);
            },
            show: () => {
                for (let i = 0; i < Math.min(messagesRef.current.length + 2, 15); i++) {
                    setTimeout(() => {
                        setAnimProgress(i - 1);
                    }, i * 50);
                }
                setTimeout(() => {
                    setAnimProgress(messagesRef.current.length);
                    setNewlyAddedMessages(0);
                }, 16 * 50);
            },
            changeMessageNumberBy: (amount: number) => {
                setNewlyAddedMessages(amount);
            },
            hide: () => {
                setAnimProgress(0);
            },
        }));

        const renderMessage = useCallback(
            ({ item: message, index }: { item: MessageData; index: number }) => {
                const prevMessage = reversedMessages[index + 1];
                const showAvatar = prevMessage ? prevMessage.sender.id !== message.sender.id : true;

                return (
                    <Message
                        author_name={message.sender.username}
                        author_id={message.sender.id}
                        author_avatar={message.sender.avatar}
                        side={userId === message.sender.id ? "right" : "left"}
                        show_avatar={showAvatar}
                        show_author={showAvatar}
                        shown={animProgress > index || !(index <= 15) || index < newlyAddedMessages}
                        sentAt={message.sentAt}
                        msg_id={message.id}
                        text={message.text}
                    />
                );
            },
            [animProgress, newlyAddedMessages, reversedMessages, userId],
        );

        return (
            <Animated.View exiting={FadeOut} layout={Constants.layoutTransition} style={styles.messagesContainer}>
                <Animated.FlatList
                    style={styles.messagesContainer}
                    contentContainerStyle={[
                        styles.contentContainerStyle,
                        {
                            paddingTop: bottomGap,
                            paddingBottom: topGap,
                            pointerEvents: disabled === true ? "none" : "auto",
                            transition: "paddingTop 0.3s ease",
                        },
                    ]}
                    data={reversedMessages}
                    renderItem={renderMessage}
                    keyExtractor={msg => msg.id.toString()}
                    ItemSeparatorComponent={splitter}
                    inverted={true}
                    initialNumToRender={15}
                    windowSize={10}
                    itemLayoutAnimation={Constants.layoutTransition}
                    {...props}
                />
            </Animated.View>
        );
    }),
);

export default MessagesContainer;
