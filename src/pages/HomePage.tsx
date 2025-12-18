import Auth from "@/Auth";
import { getSocket } from "@/Socket";
import { Colors, Constants, Styles } from "@/Style";
import Button from "@components/Button";
import MessagesContainer, { MessagesContainerHandle } from "@components/MessagesContainer";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function CreateMessage(obj: any): MessageData {
    return {
        id: obj.id || -1,
        text: obj.text || "",
        authorId: obj.author || -1,
        authorName: obj.authorName || "",
    };
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        padding: 10,
        margin: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    topPanel: {
        height: 60,
        gap: 20,
        flexDirection: "row",
    },
    contentPanel: {
        flex: 1,
    },
});

function HomePage(props: PageProps) {
    const messagesRef = useRef<MessagesContainerHandle>(null);

    async function SignOut() {
        await Auth.clearStorage();
        props.handler({ action: "go", to: "sign" });
    }

    useEffect(() => {
        async function initSocket() {
            const socket = await getSocket();
            socket.on("connect", () => {
                console.log("Connected to server");
            });
            socket.on("history", async data => {
                messagesRef.current?.setMessages(
                    data.messages.slice().map((msg: any) =>
                        CreateMessage({
                            id: msg.id,
                            text: msg.text,
                            author: msg.author_id,
                            authorName: msg.author,
                        }),
                    ),
                );
                messagesRef.current?.show();
            });
            socket.on("error", data => {
                console.error(data);
            });
            socket.emit("getChatHistory", { chat: 1 });

            socket.on("connect_error", err => {
                console.log("Connection Error:", err);
            });
        }
        initSocket();
    }, []);

    return (
        <SafeAreaView style={Styles.container}>
            <View style={[styles.panel, styles.topPanel]}>
                <Button text="Sign Out" onPress={SignOut} />
            </View>
            <View style={[styles.panel, styles.contentPanel]}>
                <MessagesContainer ref={messagesRef} />
            </View>
        </SafeAreaView>
    );
}

export default HomePage;
