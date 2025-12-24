import Auth from "@/Auth";
import { getSocket } from "@/Socket";
import { Colors, Constants, Styles } from "@/Style";
import { changeLanguage, t } from "@/Translation";
import ChatsContainer, { ChatsContainerHandle } from "@components/ChatsContainer";
import Divider from "@components/Divider";
import FloatIslandButton from "@components/FloatIslandButton";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import MessageInput from "@components/MessageInput";
import MessagesContainer, { MessagesContainerHandle } from "@components/MessagesContainer";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, ZoomIn, ZoomOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function CreateMessage(obj: any): MessageData {
    return {
        id: obj.id || -1,
        text: obj.text || "",
        authorId: obj.authorId || -1,
        authorName: obj.authorName || "",
        chatId: obj.chatId || -1,
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

export interface HomePageHandler {
    getCurrentChat: () => ChatData;
}

const HomePage = forwardRef<HomePageHandler, PageProps>((props, ref) => {
    const messagesRef = useRef<MessagesContainerHandle>(null);
    const chatsRef = useRef<ChatsContainerHandle>(null);
    const [currentTab, setCurrentTab] = useState<string>("chat");
    const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
    const currentChatRef = useRef<ChatData | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useImperativeHandle(ref, () => ({
        getCurrentChat: () => currentChatRef.current || CreateChat({}),
    }));

    const topPanelStyle = useAnimatedStyle(() => {
        return {
            position: currentTab === "chat" ? "relative" : "absolute",
            width: currentTab === "chat" ? "100%" : "auto",
            bottom: currentTab === "chat" ? 0 : 30,
            borderRadius: currentTab === "chat" ? 16 : 999,
        };
    }, [currentTab]);

    const contentPanelStyle = useAnimatedStyle(() => {
        return {
            marginBottom: keyboardHeight,
        };
    }, [keyboardHeight]);

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
                        authorId: msg.author_id,
                        authorName: msg.author,
                        chatId: msg.chat,
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
                if (data.hidden) return;
                console.error(data);
            });
            socket.on("message", (message: any) => {
                if (message.chat && parseInt(message.chat, 10) === currentChatRef.current?.id) {
                    messagesRef.current?.addMessage(
                        CreateMessage({
                            id: message.id,
                            text: message.text,
                            authorId: message.author_id,
                            authorName: message.author,
                            chatId: message.chat,
                        }),
                    );
                }
            });
        }
        initSocket();

        // Handling keyboard height
        const showSubscription = Keyboard.addListener("keyboardDidShow", e => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
            async function uninitSocket() {
                const socket = await getSocket();
                socket.off("message");
                socket.off("connect");
                socket.off("connect_error");
                socket.off("error");
            }
            uninitSocket();
        };
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
        currentChatRef.current = chat;
        setCurrentTab("chat");
        messagesRef.current?.show();
    }

    async function sendMessage(message: string) {
        if (!currentChatRef.current) return;
        const chatId = currentChatRef.current.id;
        const socket = await getSocket();
        socket.emit("msg", { text: message, chat: chatId });
    }

    return (
        <SafeAreaView style={Styles.container}>
            <Animated.View style={[styles.panel, styles.topPanel, topPanelStyle]} layout={Constants.layoutTransition}>
                {/* Chat Tab */}
                {currentTab === "chat" && (
                    <IconButton
                        icon="list-ul"
                        style={{ aspectRatio: 1, height: "100%" }}
                        onPress={() => {
                            setCurrentTab("chats");
                            setCurrentChat(null);
                            currentChatRef.current = null;
                        }}
                    />
                )}
                {currentTab === "chat" && <View style={{ flex: 1 }} />}

                {/* Chats Tab */}
                {currentTab === "chats" && (
                    <FloatIslandButton icon="language" text={t.language} onPress={() => changeLanguage(props.handler)} />
                )}
                {currentTab === "chats" && <FloatIslandButton icon="right-from-bracket" text={t.log_out} onPress={SignOut} />}
            </Animated.View>
            <Animated.View style={[styles.panel, styles.contentPanel, contentPanelStyle]} layout={Constants.layoutTransition}>
                {/* Chat Tab */}
                {currentTab === "chat" && <MessagesContainer bottomGap={60} ref={messagesRef} />}
                {currentTab === "chat" && <MessageInput style={{ position: "absolute", bottom: 10 }} onSend={sendMessage} />}

                {/* Chats Tab */}
                {currentTab === "chats" && (
                    <Animated.View
                        style={[{ display: "flex", flexDirection: "row", alignItems: "center" }]}
                        layout={Constants.layoutTransition}
                        entering={ZoomIn}
                        exiting={ZoomOut}
                    >
                        <Icon name="comments" size={24} color={Colors.primaryTextColor} />
                        <Animated.Text style={[Styles.primaryText, { fontSize: 24, margin: 10, fontWeight: "bold" }]}>
                            {t.chats}
                        </Animated.Text>
                    </Animated.View>
                )}
                {currentTab === "chats" && <Divider />}
                {currentTab === "chats" && <ChatsContainer bottomGap={70} handler={handleChat} ref={chatsRef} />}
            </Animated.View>
        </SafeAreaView>
    );
});

export default HomePage;
