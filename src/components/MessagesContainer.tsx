import { FlatList, StyleSheet, View } from "react-native";
import Message from "./Message";
import Auth from "@/Auth";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Animated, { FadeOut } from "react-native-reanimated";
import { Constants } from "@/Style";

const styles = StyleSheet.create({
    messagesContainer: {
        flex: 1,
        width: "100%",
        display: "flex",
    },
});

export interface MessagesContainerHandle {
    setMessages: (newMessages: MessageData[]) => void;
    addMessage: (message: MessageData) => void;
    show: () => void;
    hide: () => void;
}

export interface MessagesContainerProps {
    bottomGap: number;
}

const MessagesContainer = forwardRef<MessagesContainerHandle, MessagesContainerProps>((props, ref) => {
    const { bottomGap } = props;
    const messagesRef = useRef<MessageData[]>([]);
    const [animProgress, setAnimProgress] = useState<number>(0);

    const reversedMessages = [...messagesRef.current].reverse();

    useImperativeHandle(ref, () => ({
        setMessages: (newMessages: MessageData[]) => {
            messagesRef.current = newMessages;
        },
        addMessage: (message: MessageData) => {
            messagesRef.current.push(message);
            setAnimProgress(messagesRef.current.length + 1);
        },
        show: () => {
            for (let i = 0; i < Math.min(messagesRef.current.length + 2, 15); i++) {
                setTimeout(() => {
                    setAnimProgress(i - 1);
                }, i * 100);
            }
            setTimeout(() => {
                setAnimProgress(messagesRef.current.length);
            }, 16 * 100);
        },
        hide: () => {
            setAnimProgress(0);
        },
    }));

    const renderMessage = ({ item: message, index }: { item: MessageData; index: number }) => {
        const prevMessage = reversedMessages[index + 1];
        const showAvatar = prevMessage ? prevMessage.authorId !== message.authorId : true;

        return (
            <Message
                author_name={message.authorName}
                author_id={message.authorId}
                side={Auth.username === message.authorName ? "right" : "left"}
                show_avatar={showAvatar}
                show_author={showAvatar}
                shown={animProgress > index || !(index <= 15)}
            >
                {message.text}
            </Message>
        );
    };

    const splitter = () => {
        return <View style={{ height: 10 }} />;
    };

    return (
        <Animated.View exiting={FadeOut} layout={Constants.layoutTransition} style={styles.messagesContainer}>
            <FlatList
                style={styles.messagesContainer}
                contentContainerStyle={{ paddingTop: bottomGap }}
                data={reversedMessages}
                renderItem={renderMessage}
                keyExtractor={(_, index) => index.toString()}
                ItemSeparatorComponent={splitter}
                inverted={true}
                initialNumToRender={15}
                windowSize={10}
                {...props}
            />
        </Animated.View>
    );
});

export default MessagesContainer;
