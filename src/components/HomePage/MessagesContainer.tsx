import { useStorage } from "@/Storage";
import { Constants } from "@/Style";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import Message from "./Message";

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
    changeMessageNumberBy: (amount: number) => void;
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
    const [newlyAddedMessages, setNewlyAddedMessages] = useState<number>(0);
    const [userId] = useStorage<number>("user.id", -1);

    const reversedMessages = [...messagesRef.current].reverse();

    useImperativeHandle(ref, () => ({
        setMessages: (newMessages: MessageData[]) => {
            messagesRef.current = newMessages;
        },
        addMessage: (message: MessageData) => {
            messagesRef.current.push(message);
            setAnimProgress(messagesRef.current.length);
        },
        show: () => {
            for (let i = 0; i < Math.min(messagesRef.current.length + 2, 15); i++) {
                setTimeout(() => {
                    setAnimProgress(i - 1);
                }, i * 100);
            }
            setTimeout(() => {
                setAnimProgress(messagesRef.current.length);
                setNewlyAddedMessages(0);
            }, 16 * 100);
        },
        changeMessageNumberBy: (amount: number) => {
            setNewlyAddedMessages(amount);
        },
        hide: () => {
            setAnimProgress(0);
        },
    }));

    const renderMessage = ({ item: message, index }: { item: MessageData; index: number }) => {
        const prevMessage = reversedMessages[index + 1];
        const showAvatar = prevMessage ? prevMessage.sender.id !== message.sender.id : true;

        return (
            <Message
                author_name={message.sender.username}
                author_id={message.sender.id}
                side={userId === message.sender.id ? "right" : "left"}
                show_avatar={showAvatar}
                show_author={showAvatar}
                shown={animProgress > index || !(index <= 15) || index < newlyAddedMessages}
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
