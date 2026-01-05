import Auth from "@/Auth";
import { getSocket } from "@/Socket";
import { Colors, Constants, Styles } from "@/Style";
import { changeLanguage, t } from "@/Translation";
import ChatsContainer, { ChatsContainerHandle } from "@components/ChatsContainer";
import ClickableProfile from "@components/ClickableProfile";
import Divider from "@components/Divider";
import FloatIslandButton from "@components/FloatIslandButton";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import MessageInput from "@components/MessageInput";
import MessagesContainer, { MessagesContainerHandle } from "@components/MessagesContainer";
import Profile from "@components/Profile";
import { SERVER } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BackHandler, Keyboard, StyleSheet, ToastAndroid, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
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

type Tabs = "chat" | "chats" | "profile";
type TabStyles = {
    [K in keyof ViewStyle]?: Record<Tabs, ViewStyle[K]>;
};

const HomePage = forwardRef<HomePageHandler, PageProps>((props, ref) => {
    const messagesRef = useRef<MessagesContainerHandle>(null);
    const chatsRef = useRef<ChatsContainerHandle>(null);
    const [currentTab, setCurrentTab] = useState<Tabs>("chats");
    const currentTabRef = useRef<string>(currentTab);
    const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
    const currentChatRef = useRef<ChatData | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [profileId, setProfileId] = useState<number>(-1);
    const lastBackButtonPress = useRef<number>(0);

    useImperativeHandle(ref, () => ({
        getCurrentChat: () => currentChatRef.current || CreateChat({}),
    }));

    // Back button/gesture handler
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (currentTabRef.current === "chat") {
                    setCurrentTab("chats");
                    currentTabRef.current = "chats";
                    return true;
                }

                if (currentTabRef.current === "profile") {
                    setCurrentTab("chat");
                    currentTabRef.current = "chat";
                    return true;
                }

                const now = Date.now();
                if (lastBackButtonPress.current && now - lastBackButtonPress.current < 2000) {
                    BackHandler.exitApp();
                    return true;
                }

                lastBackButtonPress.current = now;
                ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);

                return true;
            };

            const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

            return () => backHandler.remove();
        }, []),
    );

    const topPanelStyles: TabStyles = {
        position: { chat: "relative", chats: "absolute", profile: "absolute" },
        width: { chat: "100%", chats: "auto", profile: "100%" },
        height: { chat: 60, chats: 60, profile: "100%" },
        bottom: { chat: 0, chats: 30, profile: 10 },
        borderRadius: { chat: 16, chats: 999, profile: 16 },
    };

    function tabStylesToAnimatedStyle(style: TabStyles) {
        "worklet";
        let to_return: ViewStyle = {};
        Object.entries(style).forEach(([key_, value]) => {
            const key = key_ as keyof ViewStyle;
            (to_return as any)[key] = value[currentTab];
        });
        return to_return;
    }

    const topPanelStyle = useAnimatedStyle(() => tabStylesToAnimatedStyle(topPanelStyles), [currentTab]);

    const contentPanelScale = useSharedValue(1);

    const contentPanelStyle = useAnimatedStyle(() => {
        return {
            marginBottom: keyboardHeight,
            transform: [{ scale: withSpring(contentPanelScale.value) }],
        };
    }, [keyboardHeight, contentPanelScale]);

    async function SignOut() {
        await Auth.clearStorage();
        props.handler({ action: "go", to: "Sign" });
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
        if (currentTab === "profile") {
            contentPanelScale.value = 0;
        } else {
            contentPanelScale.value = 1;
        }
        currentTabRef.current = currentTab;
    }, [currentTab]);

    function handleChat(chat: ChatData) {
        setCurrentChat(chat);
        currentChatRef.current = chat;
        setCurrentTab("chat");
        currentTabRef.current = "chat";
        messagesRef.current?.show();
    }

    async function sendMessage(message: string) {
        if (!currentChatRef.current) return;
        const chatId = currentChatRef.current.id;
        const socket = await getSocket();
        socket.emit("msg", { text: message, chat: chatId });
    }

    function openProfile(id: number) {
        setProfileId(id);
        setCurrentTab("profile");
        currentTabRef.current = "profile";
    }

    return (
        <SafeAreaView style={Styles.container}>
            {/* Top Panel */}
            <Animated.View style={[styles.panel, styles.topPanel, topPanelStyle]} layout={Constants.layoutTransition}>
                {/* Chat Tab */}
                {currentTab === "chat" && (
                    <IconButton
                        icon="list-ul"
                        style={{ aspectRatio: 1, height: "100%" }}
                        onPress={() => {
                            setCurrentTab("chats");
                            currentTabRef.current = "chats";
                            setCurrentChat(null);
                            currentChatRef.current = null;
                        }}
                    />
                )}
                {currentTab === "chat" &&
                    (() => {
                        const isPrivate = currentChat?.participants.length === 2;
                        const otherParticipant = currentChat?.participants.find(p => p.id !== Auth.id) || { id: -1 };

                        return (
                            <ClickableProfile
                                image={`${SERVER}/avatars/${otherParticipant.id}.webp`}
                                text={currentChat?.title}
                                bottomText={isPrivate ? t.private_chat : t.group_chat}
                                onPress={isPrivate ? () => openProfile(otherParticipant.id) : () => {}}
                            />
                        );
                    })()}
                {currentTab === "chat" && <View style={{ flex: 1 }} /> /*Filler*/}

                {/* Chats Tab */}
                {currentTab === "chats" && (
                    <FloatIslandButton icon="language" text={t.language} onPress={() => changeLanguage(props.handler)} />
                )}
                {currentTab === "chats" && <FloatIslandButton icon="right-from-bracket" text={t.log_out} onPress={SignOut} />}

                {/* Profile Tab */}
                {currentTab === "profile" && <Profile id={profileId} />}
            </Animated.View>

            {/* Content Panel */}
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
