import { FlatList, StyleSheet, View } from "react-native";
import Message from "./Message";
import Auth from "@/Auth";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const styles = StyleSheet.create({
    messagesContainer: {
        flex: 1,
        width: "100%",
        display: "flex",
    },
});

export interface MessagesContainerHandle {
    setMessages: (newMessages: MessageData[]) => void;
    show: () => void;
}

const MessagesContainer = forwardRef<MessagesContainerHandle>((props: any, ref) => {
    const messagesRef = useRef<MessageData[]>([]);
    const [showProgress, setShowProgress] = useState(0);

    const reversedMessages = [...messagesRef.current].reverse();

    useImperativeHandle(ref, () => ({
        setMessages: (newMessages: MessageData[]) => {
            messagesRef.current = newMessages;
        },
        show: () => {
            for (let i = 0; i < Math.min(messagesRef.current.length, 15); i++) {
                setTimeout(() => {
                    setShowProgress(i - 1);
                }, i * 100);
            }
            setTimeout(() => {
                setShowProgress(messagesRef.current.length);
            }, 16 * 100);
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
                shown={showProgress > index}
            >
                {message.text}
            </Message>
        );
    };

    const splitter = () => {
        return <View style={{ height: 10 }} />;
    };

    return (
        <FlatList
            style={styles.messagesContainer}
            data={reversedMessages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => String(item.id || index)}
            ItemSeparatorComponent={splitter}
            inverted={true}
            initialNumToRender={15}
            {...props}
        />
    );
});

export default MessagesContainer;
