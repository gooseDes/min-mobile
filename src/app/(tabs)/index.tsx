import Auth from "@/auth";
import getDb from "@/db/client";
import { chatsTable, chatUsersTable, messagesTable, usersTable } from "@/db/schema";
import { ProcessChatsAndReturn, ProcessHistoryAndReturn } from "@/db/utils";
import { API_URL } from "@/env";
import { apiClient } from "@/socket";
import Storage from "@/storage";
import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import Translation from "@/translation";
import { CreateChat, CreateMessage, getShadow, homePageRef } from "@/utils";
import ClickableProfile from "@components/ClickableProfile";
import Divider from "@components/Divider";
import AddChatButton from "@components/HomePage/AddChatButton";
import ChatsContainer, { ChatsContainerHandle } from "@components/HomePage/ChatsContainer";
import MessageInput from "@components/HomePage/MessageInput";
import MessagesContainer, { MessagesContainerHandle } from "@components/HomePage/MessagesContainer";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import Profile from "@components/Profile";
import ScreenPanel from "@components/ScreenPanel";
import SurelyAnimatedView from "@components/SurelyAnimatedView";
import { useTranslation } from "@contexts/TranslationContext";
import { ChatData as ApiChatData } from "@min/api-client";
import { getMessaging, getToken } from "@/fcm";
import { messageInputRef } from "@services/inputControlService";
import { showPopup } from "@services/popupService";
import { setTabBarVisibility } from "@services/tabBarControlService";
import { vibrateEffectPreset } from "@specs/HapticsModule";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BackHandler, Keyboard, NativeEventSubscription, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
    SlideInUp,
    SlideOutUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";
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
            position: "absolute",
            width: "100%",
            borderRadius: theme.rounding,
            padding: 0,
            flexDirection: "row",
            zIndex: 1,
            margin: 0,
            boxShadow: getShadow(theme),
        },
        contentPanel: {
            flex: 1,
            overflow: "visible",
            padding: 0,
            margin: 0,
        },
        sizedContainer: {
            display: "flex",
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            overflow: "visible",
            gap: 10,
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

function HomePageWrapper() {
    return <HomePage ref={homePageRef} />;
}

const HomePage = forwardRef<HomePageHandler>((_props, ref) => {
    const messagesRef = useRef<MessagesContainerHandle>(null);
    const chatsRef = useRef<ChatsContainerHandle>(null);
    const [currentTab, setCurrentTab] = useState<Tabs>("chats");
    const currentTabRef = useRef<Tabs>(currentTab);
    const [currentChat, setCurrentChat] = useState<ChatData | null>(null);
    const currentChatRef = useRef<ChatData | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [profileId, setProfileId] = useState<number>(-1);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [insideContainerSize, setInsideContainerSize] = useState<Size>({ width: screenWidth, height: screenHeight });
    const [chatTabBottomGap, setChatTabBottomGap] = useState<number>(66);
    const backListener = useRef<NativeEventSubscription | null>(null);
    const { t, changeLanguage } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const styles = useAppStyles(createStyles);
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);

    useImperativeHandle(ref, () => ({
        getCurrentChat: () => currentChatRef.current || CreateChat({}),
        getCurrentTab: () => currentTabRef.current,
    }));

    // Back button/gesture handler
    useEffect(() => {
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
        };

        if (currentTab !== "chats") {
            backListener.current = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        } else {
            backListener.current?.remove();
        }

        return () => backListener.current?.remove();
    }, [currentTab]);

    const topPanelWidth = useSharedValue<number | "100%">("100%");
    const topPanelHeight = useSharedValue<number | "100%">(60);
    const topPanelTop = useSharedValue<number>(0);
    const topPanelPaddingHorizontal = useSharedValue<number>(0);

    const topPanelStyle = useAnimatedStyle(() => ({
        width: topPanelWidth.value,
        height: topPanelHeight.value,
        top: topPanelTop.value,
        paddingHorizontal: topPanelPaddingHorizontal.value,
    }));

    const contentPanelScale = useSharedValue(1);

    const contentPanelStyle = useAnimatedStyle(() => {
        return {
            marginBottom: keyboardHeight,
            transform: [{ scale: withSpring(contentPanelScale.value) }],
        };
    }, [keyboardHeight, contentPanelScale]);

    async function requestHistory() {
        const db = await getDb();
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
        const messagesInfo = await apiClient.fetchChatMessages({ chatId: currentChat?.id || 1 });
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
        const db = await getDb();
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

    async function addChat(chat: ApiChatData) {
        const db = await getDb();
        chat.participants.forEach(async p => {
            await db
                .insert(usersTable)
                .values(p)
                .onConflictDoUpdate({ target: [usersTable.id], set: { username: p.username, avatar: p.avatar } });
            await db.insert(chatUsersTable).values({ chatId: chat.id, userId: p.id }).onConflictDoNothing();
        });
        await db.insert(chatsTable).values({ id: chat.id, type: chat.type, title: chat.name });
        chatsRef.current?.setChats([{ ...chat, title: chat.name }, ...chatsRef.current?.getChats()]);
        chatsRef.current?.showWithoutAnimation();
    }

    useEffect(() => {
        changeLanguage(Translation.getCurrentLanguage());

        const connectSub = apiClient.socket.subscribe("connect", async () => {
            console.log("Connected to server");

            apiClient.fetchUser({ userId: Auth.id || -1 }).then(res => {
                if (res.success) Storage.set("avatar", res.user.avatar);
            });

            const messaging = getMessaging();

            // Get Firebase token
            const token = await getToken(messaging);

            // Send Firebase token to server
            apiClient.linkFcmToken({ token });
        });
        const connectErrorSub = apiClient.socket.subscribe("connect_error", err => {
            if (err.message.includes("Invalid token")) {
                showPopup(t.relogin, t.relogin_msg, [{ text: t.ok, onPress: () => router.replace("auth") }]);
            } else {
                console.log("Connection Error:", err);
            }
        });
        const errorSub = apiClient.socket.subscribe("error", data => {
            if (data.hidden) return;
            console.error(data);
        });
        const messageSub = apiClient.subscribeToMessages(async message => {
            if (message.chatId === currentChatRef.current?.id) {
                messagesRef.current?.addMessage(
                    CreateMessage({
                        id: message.id,
                        text: message.content,
                        sender: message.sender,
                        chatId: message.chatId,
                        sentAt: message.sentAt,
                    }),
                );
                vibrateEffectPreset("quick_fall");
                (await getDb())
                    .insert(messagesTable)
                    .values({
                        id: message.id,
                        content: message.content,
                        senderId: message.senderId,
                        chatId: message.chatId,
                        sentAt: message.sentAt,
                    })
                    .run();
            }
        });
        const deleteMessageSub = apiClient.subscribeToDeletingMessages(async messageId => {
            messagesRef.current?.deleteMessage(messageId);
            (await getDb()).delete(messagesTable).where(eq(messagesTable.id, messageId)).run();
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
        topPanelWidth.value = currentTab === "profile" ? "100%" : insideContainerSize.width - 20;
        topPanelHeight.value = currentTab === "profile" ? "100%" : 60;
        topPanelTop.value = currentTab === "profile" ? 0 : 10;
        topPanelPaddingHorizontal.value = withSpring(currentTab === "profile" ? 10 : 0);
        setTabBarVisibility(currentTab === "chats");
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
        apiClient.sendMessage({ content: message, chatId });
    }

    function openProfile(id: number) {
        setProfileId(id);
        setCurrentTab("profile");
        currentTabRef.current = "profile";
    }

    function handleInputUpdate(text: string) {
        if (text.startsWith("/reply")) {
            setChatTabBottomGap(86);
        } else {
            setChatTabBottomGap(66);
        }
    }

    return (
        <ScreenPanel insidePanel={false} setSize={setInsideContainerSize}>
            <View
                style={[
                    styles.sizedContainer,
                    {
                        left: insets.left + Styles.container.paddingHorizontal,
                        top: insets.top + Styles.container.paddingVertical,
                        ...insideContainerSize,
                    },
                ]}
            >
                {/* Top Panel */}
                {currentTab !== "chats" && (
                    <Animated.View
                        entering={SlideInUp.springify()}
                        exiting={SlideOutUp.springify()}
                        style={[styles.panel, styles.topPanel, topPanelStyle]}
                        layout={Constants.layoutTransition}
                    >
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
                                        image={`${API_URL}/avatars/${otherParticipant.avatar}.webp`}
                                        text={currentChat?.title}
                                        bottomText={isPrivate ? t.private_chat : t.group_chat}
                                        onPress={isPrivate ? () => openProfile(otherParticipant.id) : () => {}}
                                    />
                                );
                            })()}
                        {currentTab === "chat" && <View style={{ flex: 1 }} /> /*Filler*/}

                        {/* Profile Tab */}
                        {currentTab === "profile" && <Profile id={profileId} />}
                    </Animated.View>
                )}

                {/* Content Panel */}
                <Animated.View
                    style={[styles.panel, styles.contentPanel, contentPanelStyle]}
                    layout={Constants.layoutTransition}
                >
                    {/* Chat Tab */}
                    {currentTab === "chat" && <MessagesContainer bottomGap={chatTabBottomGap} topGap={70} ref={messagesRef} />}

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
                            <Icon name="comments" iconStyle="regular" size={24} color={theme.primaryTextColor} />
                            <Text style={[Styles.titleText, { marginLeft: 10 }]}>{t.chats}</Text>
                        </SurelyAnimatedView>
                    )}
                    {currentTab === "chats" && <Divider />}
                    {currentTab === "chats" && <ChatsContainer bottomGap={90} handler={handleChat} ref={chatsRef} />}
                    {currentTab === "chats" && <AddChatButton onChatCreated={addChat} />}
                </Animated.View>
            </View>
            {currentTab === "chat" && (
                <MessageInput
                    ref={messageInputRef}
                    style={{
                        position: "absolute",
                        bottom: Styles.container.paddingVertical + insets.bottom + 10 + keyboardHeight,
                        width: insideContainerSize.width - 20,
                        alignSelf: "center",
                    }}
                    onTextChanged={handleInputUpdate}
                    onSend={sendMessage}
                />
            )}
        </ScreenPanel>
    );
});

export default HomePageWrapper;
