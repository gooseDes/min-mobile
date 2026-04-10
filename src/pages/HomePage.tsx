import Auth from "@/Auth";
import db from "@/db/Client";
import { chatsTable, chatUsersTable, messagesTable, usersTable } from "@/db/Schema";
import { ProcessChatsAndReturn, ProcessHistoryAndReturn } from "@/db/Utils";
import { getSocket } from "@/Socket";
import { Colors, Constants, Styles } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import { CreateChat, CreateMessage, timestampToDate } from "@/Utils";
import ClickableProfile from "@components/ClickableProfile";
import Divider from "@components/Divider";
import FloatIslandButton from "@components/FloatIslandButton";
import AddChatButton from "@components/HomePage/AddChatButton";
import ChatsContainer, { ChatsContainerHandle } from "@components/HomePage/ChatsContainer";
import MessageInput from "@components/HomePage/MessageInput";
import MessagesContainer, { MessagesContainerHandle } from "@components/HomePage/MessagesContainer";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import Profile from "@components/Profile";
import SurelyAnimatedView from "@components/SurelyAnimatedView";
import { SERVER } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { messageInputRef } from "@services/InputControlService";
import { navigate } from "@services/NavigationService";
import { eq } from "drizzle-orm";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Alert, BackHandler, Keyboard, StyleSheet, Text, ToastAndroid, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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

const HomePage = forwardRef<HomePageHandler>((_props, ref) => {
    const messagesRef = useRef<MessagesContainerHandle>(null);
    const chatsRef = useRef<ChatsContainerHandle>(null);
    const [currentTab, setCurrentTab] = useState<Tabs>("chats");
    const currentTabRef = useRef<string>(currentTab);
    const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
    const currentChatRef = useRef<ChatData | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [profileId, setProfileId] = useState<number>(-1);
    const lastBackButtonPress = useRef<number>(0);
    const { t } = useTranslation();

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
        navigate("Sign");
    }

    async function requestHistory() {
        // Initialize messages from database
        db.query.messagesTable
            .findMany({
                with: {
                    sender: true,
                    chat: true,
                },
                where: (table, { eq: eq_ }) => eq_(table.chatId, currentChatRef.current?.id || -1),
            })
            .then(messages_db => {
                const messages = messages_db.slice().map(message => {
                    return CreateMessage({
                        id: message.id,
                        text: message.content,
                        sender: { id: message.sender?.id, username: message.sender?.username },
                        chatId: message.chatId,
                        sentAt: message.sentAt,
                    });
                });
                messagesRef.current?.setMessages(messages);
                messagesRef.current?.show();
            });

        // Initialize messages from socket
        const socket = await getSocket();
        socket.on("history", async data => {
            //console.log(data);
            if (data.messages.length > 0) {
                const lastMessage = await db.query.messagesTable.findFirst({
                    where: eq(messagesTable.chatId, currentChat?.id || 0),
                    orderBy: (messages, { desc }) => [desc(messages.id)],
                });
                const lastSocketMessage = data.messages.findIndex((msg: any) => msg.id === lastMessage?.id);
                const diff = data.messages.length - ((lastSocketMessage || 0) + 1);
                if (lastSocketMessage !== -1) {
                    messagesRef.current?.setMessages(await ProcessHistoryAndReturn(data));
                    messagesRef.current?.changeMessageNumberBy(diff >= 0 ? diff : 0);
                } else {
                    messagesRef.current?.setMessages(await ProcessHistoryAndReturn(data));
                    messagesRef.current?.show();
                }
            } else {
                messagesRef.current?.setMessages(await ProcessHistoryAndReturn(data));
                messagesRef.current?.show();
            }
            socket.off("history");
        });
        socket.emit("getChatHistory", { chat: currentChat?.id || 1 });
    }

    async function requestChats() {
        // Initialize chats from database
        db.query.chatsTable
            .findMany({
                with: {
                    chatUsers: {
                        with: {
                            user: true,
                        },
                    },
                },
            })
            .then(chats_db => {
                const chats = chats_db.slice().map(chat => {
                    return CreateChat({
                        id: chat.id,
                        title: chat.title,
                        participants: chat.chatUsers.map(chatUser => chatUser.user),
                    });
                });
                chatsRef.current?.setChats(chats);
                chatsRef.current?.show();
            });

        // Initialize chats from socket
        const socket = await getSocket();
        socket.off("chats");
        socket.on("chats", async data => {
            // Clear db
            try {
                await db.delete(chatsTable);
            } catch {}
            try {
                await db.delete(chatUsersTable);
            } catch {}
            try {
                await db.delete(usersTable);
            } catch {}

            // Save chats to db, reformat and show them
            const prevChats = chatsRef.current?.getChats();
            chatsRef.current?.setChats(await ProcessChatsAndReturn(data));
            if (prevChats?.length) {
                chatsRef.current?.showWithoutAnimation();
            } else {
                chatsRef.current?.show();
            }
            //socket.off("chats");
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
                if (err.message.includes("Invalid token")) {
                    Alert.alert(t.relogin || "", t.relogin_msg, [{ text: t.ok, onPress: () => navigate("Sign") }]);
                } else {
                    console.log("Connection Error:", err);
                }
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
                            sender: { id: message.author_id, username: message.author },
                            chatId: message.chat,
                            sentAt: timestampToDate(message.sent_at),
                        }),
                    );
                    db.insert(messagesTable)
                        .values({
                            id: message.id,
                            content: message.text,
                            senderId: message.author_id,
                            chatId: message.chat,
                            sentAt: timestampToDate(message.sent_at),
                        })
                        .run();
                }
            });
            socket.on("deleteMessage", (data: any) => {
                messagesRef.current?.deleteMessage(data.message);
                db.delete(messagesTable).where(eq(messagesTable.id, data.message)).run();
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
                    <FloatIslandButton icon="gear" text={t.settings} onPress={() => navigate("Settings", "push")} />
                )}
                {/*currentTab === "chats" && <FloatIslandButton icon="user-circle" text="Profile" onPress={() => {}} />*/}
                {currentTab === "chats" && <FloatIslandButton icon="right-from-bracket" text={t.log_out} onPress={SignOut} />}

                {/* Profile Tab */}
                {currentTab === "profile" && <Profile id={profileId} />}
            </Animated.View>

            {/* Content Panel */}
            <Animated.View style={[styles.panel, styles.contentPanel, contentPanelStyle]} layout={Constants.layoutTransition}>
                {/* Chat Tab */}
                {currentTab === "chat" && <MessagesContainer bottomGap={60} ref={messagesRef} />}
                {currentTab === "chat" && (
                    <MessageInput
                        ref={messageInputRef}
                        style={{ position: "absolute", bottom: 10, width: "100%" }}
                        onSend={sendMessage}
                    />
                )}

                {/* Chats Tab */}
                {currentTab === "chats" && (
                    <SurelyAnimatedView
                        style={[{ display: "flex", flexDirection: "row", alignItems: "center", margin: 10, marginTop: 4 }]}
                        layout={Constants.layoutTransition}
                        entering={ZoomIn}
                        exiting={ZoomOut}
                    >
                        <Icon name="comments" size={24} color={Colors.primaryTextColor} />
                        <Text style={[Styles.titleText, { marginLeft: 10 }]}>{t.chats}</Text>
                    </SurelyAnimatedView>
                )}
                {currentTab === "chats" && <Divider />}
                {currentTab === "chats" && <ChatsContainer bottomGap={70} handler={handleChat} ref={chatsRef} />}
                {currentTab === "chats" && <AddChatButton />}
            </Animated.View>
        </SafeAreaView>
    );
});

export default HomePage;
