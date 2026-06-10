import Auth from "@/Auth";
import db from "@/db/Client";
import { chatsTable, chatUsersTable, messagesTable, usersTable } from "@/db/Schema";
import { ProcessChatsAndReturn, ProcessHistoryAndReturn } from "@/db/Utils";
import { apiClient } from "@/Socket";
import Storage from "@/Storage";
import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import Translation from "@/Translation";
import { CreateChat, CreateMessage, getShadow, timestampToDate } from "@/Utils";
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
import { useTranslation } from "@contexts/TranslationContext";
import { SERVER } from "@env";
import { getMessaging, getToken } from "@react-native-firebase/messaging";
import { useFocusEffect } from "@react-navigation/native";
import { messageInputRef } from "@services/InputControlService";
import { navigate } from "@services/NavigationService";
import { showPopup } from "@services/PopupService";
import { vibrateEffectPreset } from "@specs/HapticsModule";
import { eq } from "drizzle-orm";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BackHandler, Keyboard, StyleSheet, Text, ToastAndroid, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        panel: {
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.rounding,
            padding: 10,
            margin: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            boxShadow: getShadow(theme),
        },
        topPanel: {
            padding: 0,
            flexDirection: "row",
            zIndex: 1,
            boxShadow: getShadow(theme),
        },
        contentPanel: {
            flex: 1,
            overflow: "visible",
            padding: 0,
        },
        sizedContainer: {
            display: "flex",
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            overflow: "visible",
        },
        container: {
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.backgroundColor,
        },
    });

export interface HomePageHandler {
    getCurrentChat: () => ChatData;
    getCurrentTab: () => Tabs;
}

type Tabs = "chat" | "chats" | "profile";
type TabStyles = {
    [K in keyof ViewStyle]?: Record<Tabs, ViewStyle[K]>;
};

const HomePage = forwardRef<HomePageHandler>((_props, ref) => {
    const messagesRef = useRef<MessagesContainerHandle>(null);
    const chatsRef = useRef<ChatsContainerHandle>(null);
    const [currentTab, setCurrentTab] = useState<Tabs>("chats");
    const currentTabRef = useRef<Tabs>(currentTab);
    const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
    const currentChatRef = useRef<ChatData | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [profileId, setProfileId] = useState<number>(-1);
    const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 });
    const [insideContainerSize, setInsideContainerSize] = useState<Size>({ width: 0, height: 0 });
    const [chatTabBottomGap, setChatTabBottomGap] = useState<number>(70);
    const lastBackButtonPress = useRef<number>(0);
    const { t, changeLanguage } = useTranslation();
    const insets = useSafeAreaInsets();
    const styles = useAppStyles(createStyles);
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);

    useImperativeHandle(ref, () => ({
        getCurrentChat: () => currentChatRef.current || CreateChat({}),
        getCurrentTab: () => currentTabRef.current,
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
        bottom: { chat: 0, chats: 10, profile: -10 },
        borderRadius: { chat: 16, chats: 30, profile: 16 },
        paddingHorizontal: { chat: 0, chats: 10, profile: 10 },
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
                        sender: { id: message.sender?.id, username: message.sender?.username, avatar: message.sender?.avatar },
                        chatId: message.chatId,
                        sentAt: message.sentAt,
                    });
                });
                messagesRef.current?.setMessages(messages);
                messagesRef.current?.show();
            });

        // Initialize messages from socket
        const messagesInfo = await apiClient.fetchChatMessages({ id: currentChat?.id || 1 });
        if (messagesInfo.success) {
            const messages = messagesInfo.messages;
            if (messages.length > 0) {
                const lastMessage = await db.query.messagesTable.findFirst({
                    where: eq(messagesTable.chatId, currentChat?.id || 0),
                    orderBy: (msgs, { desc }) => [desc(msgs.id)],
                });
                const lastSocketMessage = messages.findIndex((msg: any) => msg.id === lastMessage?.id);
                const diff = messages.length - ((lastSocketMessage || 0) + 1);
                messagesRef.current?.setMessages(await ProcessHistoryAndReturn(messagesInfo));
                if (lastSocketMessage !== -1) {
                    messagesRef.current?.changeMessageNumberBy(diff >= 0 ? diff : 0);
                } else {
                    messagesRef.current?.show();
                }
            } else {
                messagesRef.current?.setMessages(await ProcessHistoryAndReturn(messagesInfo));
                messagesRef.current?.show();
            }
        }
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
        const chatsInfo = await apiClient.fetchChats();
        if (chatsInfo.success) {
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
            chatsRef.current?.setChats(await ProcessChatsAndReturn(chatsInfo));
            if (prevChats?.length) {
                chatsRef.current?.showWithoutAnimation();
            } else {
                chatsRef.current?.show();
            }
        }
    }

    useEffect(() => {
        changeLanguage(Translation.getCurrentLanguage());

        const connectSub = apiClient.socket.subscribe("connect", async () => {
            console.log("Connected to server");

            apiClient.fetchUser({ id: Auth.id || -1 }).then(res => {
                if (res.success) Storage.set("avatar", res.user.avatar);
            });

            const messaging = getMessaging();

            // Get Firebase token
            const token = await getToken(messaging);

            // Send Firebase token to server
            apiClient.socket.emit("addFcmToken", { token });
        });
        const connectErrorSub = apiClient.socket.subscribe("connect_error", err => {
            if (err.message.includes("Invalid token")) {
                showPopup(t.relogin, t.relogin_msg, [{ text: t.ok, onPress: () => navigate("Sign") }]);
            } else {
                console.log("Connection Error:", err);
            }
        });
        const errorSub = apiClient.socket.subscribe("error", data => {
            if (data.hidden) return;
            console.error(data);
        });
        const messageSub = apiClient.socket.subscribe("message", (message: any) => {
            if (message.chat && parseInt(message.chat, 10) === currentChatRef.current?.id) {
                messagesRef.current?.addMessage(
                    CreateMessage({
                        id: message.id,
                        text: message.text,
                        sender: { id: message.author_id, username: message.author, avatar: message.author_avatar },
                        chatId: message.chat,
                        sentAt: timestampToDate(message.sent_at),
                    }),
                );
                vibrateEffectPreset("quick_fall");
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
        const deleteMessageSub = apiClient.socket.subscribe("deleteMessage", (data: any) => {
            messagesRef.current?.deleteMessage(data.message);
            db.delete(messagesTable).where(eq(messagesTable.id, data.message)).run();
        });

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
            connectSub.remove();
            connectErrorSub.remove();
            errorSub.remove();
            messageSub.remove();
            deleteMessageSub.remove();
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
        apiClient.socket.emit("msg", { text: message, chat: chatId });
    }

    function openProfile(id: number) {
        setProfileId(id);
        setCurrentTab("profile");
        currentTabRef.current = "profile";
    }

    function handleInputUpdate(text: string) {
        if (text.startsWith("/reply")) {
            setChatTabBottomGap(90);
        } else {
            setChatTabBottomGap(70);
        }
    }

    useEffect(() => {
        setInsideContainerSize({
            width: containerSize.width - Styles.container.paddingHorizontal * 2 - insets.left - insets.right,
            height: containerSize.height - Styles.container.paddingVertical * 2 - insets.top - insets.bottom,
        });
    }, [containerSize, insets.top, insets.bottom]);

    return (
        <View
            style={styles.container}
            onLayout={event =>
                setContainerSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })
            }
        >
            <View
                style={[
                    styles.sizedContainer,
                    {
                        left: insets.left + Styles.container.paddingHorizontal,
                        top: insets.top, // Looks better without + Styles.container.paddingVertical, idk why
                        ...insideContainerSize,
                    },
                ]}
            >
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
                            const otherParticipant = currentChat?.participants.find(p => p.id !== Auth.id) || {
                                id: -1,
                            };

                            return (
                                <ClickableProfile
                                    image={`${SERVER}/avatars/${otherParticipant.avatar}.webp`}
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
                    {currentTab === "chats" && (
                        <FloatIslandButton icon="user-circle" text={t.profile} onPress={() => navigate("Profile", "push")} />
                    )}

                    {/* Profile Tab */}
                    {currentTab === "profile" && <Profile id={profileId} />}
                </Animated.View>

                {/* Content Panel */}
                <Animated.View
                    style={[styles.panel, styles.contentPanel, contentPanelStyle]}
                    layout={Constants.layoutTransition}
                >
                    {/* Chat Tab */}
                    {currentTab === "chat" && <MessagesContainer bottomGap={chatTabBottomGap} ref={messagesRef} />}

                    {/* Chats Tab */}
                    {currentTab === "chats" && (
                        <SurelyAnimatedView
                            style={[
                                {
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    margin: 10,
                                },
                            ]}
                            layout={Constants.layoutTransition}
                            entering={ZoomIn}
                            exiting={ZoomOut}
                        >
                            <Icon name="comments" size={24} color={theme.primaryTextColor} />
                            <Text style={[Styles.titleText, { marginLeft: 10 }]}>{t.chats}</Text>
                        </SurelyAnimatedView>
                    )}
                    {currentTab === "chats" && <Divider />}
                    {currentTab === "chats" && <ChatsContainer bottomGap={90} handler={handleChat} ref={chatsRef} />}
                    {currentTab === "chats" && <AddChatButton />}
                </Animated.View>
            </View>
            {currentTab === "chat" && (
                <MessageInput
                    ref={messageInputRef}
                    style={{
                        position: "absolute",
                        bottom: Styles.container.paddingVertical + insets.bottom + 15 + keyboardHeight,
                        width: insideContainerSize.width - 20,
                    }}
                    onTextChanged={handleInputUpdate}
                    onSend={sendMessage}
                />
            )}
        </View>
    );
});

export default HomePage;
