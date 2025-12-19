import Auth from "@/Auth";
import { getSocket } from "@/Socket";
import { Colors, Constants, Styles } from "@/Style";
import Button from "@components/Button";
import ChatsContainer, { ChatsContainerHandle } from "@components/ChatsContainer";
import Divider from "@components/Divider";
import FloatIslandButton from "@components/FloatIslandButton";
import IconButton from "@components/IconButton";
import MessagesContainer, { MessagesContainerHandle } from "@components/MessagesContainer";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function CreateMessage(obj: any): MessageData {
    return {
        id: obj.id || -1,
        text: obj.text || "",
        authorId: obj.author || -1,
        authorName: obj.authorName || "",
    };
}

function CreateChat(obj: any): ChatData {
    return {
        id: obj.id || -1,
        title: obj.title || "",
        participants: obj.participants || [],
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
        zIndex: 1,
    },
    contentPanel: {
        flex: 1,
        overflow: "visible",
    },
});

function HomePage(props: PageProps) {
    const messagesRef = useRef<MessagesContainerHandle>(null);
    const chatsRef = useRef<ChatsContainerHandle>(null);
    const [currentTab, setCurrentTab] = useState<string>("chat");
    const [currentChat, setCurrentChat] = useState<ChatData | null>(null);

    const topPanelStyle = useAnimatedStyle(() => {
        return {
            position: currentTab === "chat" ? "relative" : "absolute",
            width: currentTab === "chat" ? "100%" : "auto",
            bottom: currentTab === "chat" ? 0 : 40,
            borderRadius: currentTab === "chat" ? 16 : 999,
        };
    }, [currentTab]);

    async function SignOut() {
        await Auth.clearStorage();
        props.handler({ action: "go", to: "sign" });
    }

    async function requestHistory() {
        const socket = await getSocket();
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
            socket.off("history");
        });
        socket.emit("getChatHistory", { chat: currentChat?.id || 1 });
    }

    async function requestChats() {
        const socket = await getSocket();
        socket.on("chats", async data => {
            const chats: ChatData[] = [CreateChat({ id: 1, title: "Default Chat", participants: [] })];
            const chats2 = data.chats.slice().map((chat: any) =>
                CreateChat({
                    id: chat.id,
                    title: chat.name,
                    participants: chat.participants,
                }),
            );
            chats.push(...chats2);
            chatsRef.current?.setChats(chats);
            chatsRef.current?.show();
            socket.off("chats");
        });
        socket.emit("getChats", {});
    }

    useEffect(() => {
        async function initSocket() {
            const socket = await getSocket();
            socket.on("connect", () => {
                console.log("Connected to server");
            });
            socket.on("connect_error", err => {
                console.log("Connection Error:", err);
            });
            socket.on("error", data => {
                console.error(data);
            });
        }
        initSocket();
    }, []);

    useEffect(() => {
        if (currentTab === "chats") {
            requestChats();
            messagesRef.current?.hide();
        }
        if (currentTab === "chat") {
            requestHistory();
        }
    }, [currentTab]);

    function handleChat(chat: ChatData) {
        setCurrentChat(chat);
        setCurrentTab("chat");
        messagesRef.current?.show();
    }

    return (
        <SafeAreaView style={Styles.container}>
            <Animated.View style={[styles.panel, styles.topPanel, topPanelStyle]} layout={Constants.layoutTransition}>
                {/* Chat Tab */}
                {currentTab === "chat" && (
                    <IconButton
                        icon="list-ul"
                        style={{ aspectRatio: 1, height: "100%" }}
                        onPress={() => setCurrentTab("chats")}
                    />
                )}
                {currentTab === "chat" && <Button text="Sign Out" onPress={SignOut} style={{ flex: 1 }} />}

                {/* Chats Tab */}
                {currentTab === "chats" && <FloatIslandButton icon="user" text="User" />}
                {currentTab === "chats" && <FloatIslandButton icon="right-from-bracket" text="Log Out" onPress={SignOut} />}
            </Animated.View>
            <Animated.View style={[styles.panel, styles.contentPanel]} layout={Constants.layoutTransition}>
                {/* Chat Tab */}
                {currentTab === "chat" && <MessagesContainer ref={messagesRef} />}

                {/* Chats Tab */}
                {currentTab === "chats" && (
                    <Animated.Text style={[Styles.primaryText, { fontSize: 24, margin: 10, fontWeight: "bold" }]}>
                        Chats
                    </Animated.Text>
                )}
                {currentTab === "chats" && <Divider />}
                {currentTab === "chats" && <ChatsContainer handler={handleChat} ref={chatsRef} />}
            </Animated.View>
        </SafeAreaView>
    );
}

export default HomePage;
