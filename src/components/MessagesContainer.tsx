import { ScrollView, StyleSheet } from "react-native";
import Message from "./Message";
import { MessageData } from "@/Types";

const styles = StyleSheet.create({
    messagesContainer: {
        flex: 1,
        width: "100%",
    },
});

type MessageContainerProps = {
    messages: MessageData[];
};

function MessagesContainer({ messages }: MessageContainerProps) {
    return (
        <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={{ gap: 10 }}
        >
            {messages.map((message, index) => (
                <Message key={index}>{message.text}</Message>
            ))}
        </ScrollView>
    );
}

export default MessagesContainer;
