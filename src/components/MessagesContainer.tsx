import { FlatList, StyleSheet, View } from "react-native";
import Message from "./Message";
import Auth from "@/Auth";

const styles = StyleSheet.create({
    messagesContainer: {
        flex: 1,
        width: "100%",
        display: "flex",
    },
});

type MessageContainerProps = {
    messages: MessageData[];
};

function MessagesContainer({ messages }: MessageContainerProps) {
    const renderMessage = ({ item: message, index }: { item: MessageData; index: number }) => {
        const prevMessage = messages[index + 1];
        const showAvatar = prevMessage ? prevMessage.authorId !== message.authorId : true;

        return (
            <Message
                author_name={message.authorName}
                author_id={message.authorId}
                side={Auth.username === message.authorName ? "right" : "left"}
                show_avatar={showAvatar}
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
            data={messages.reverse()}
            renderItem={renderMessage}
            keyExtractor={(item, index) => String(item.id || index)}
            ItemSeparatorComponent={splitter}
            inverted={true}
            initialNumToRender={15}
        />
    );
}

export default MessagesContainer;
