import { BackHandler, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { JSX, useEffect, useRef, useState } from "react";
import SignPage from "./pages/SignPage";
import Auth from "./Auth";
import HomePage, { HomePageHandler } from "./pages/HomePage";
import Animated, { Easing, ZoomInDown, ZoomOutUp } from "react-native-reanimated";
import { Colors } from "./Style";
import {
    AuthorizationStatus,
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
    setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import notifee, { AndroidCategory, AndroidStyle } from "@notifee/react-native";
import { getSocket } from "./Socket";
import Notification, { NotificationHandle } from "@components/Notification";
import Translation from "./Translation";
import { SERVER } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

function PageWrapper({ children }: { children: JSX.Element }) {
    return (
        <Animated.View
            style={{ flex: 1 }}
            entering={ZoomInDown.duration(600).easing(Easing.out(Easing.cubic))}
            exiting={ZoomOutUp.duration(600).easing(Easing.out(Easing.cubic))}
        >
            {children}
        </Animated.View>
    );
}

function CreateRemoteMessagePayload(obj: any): RemoteMessagePayload {
    return {
        authorName: obj.authorName || "",
        text: obj.text || "",
        chatId: parseInt(obj.chatId, 10) || -1,
        authorId: parseInt(obj.authorId, 10) || -1,
        messageId: parseInt(obj.messageId, 10) || -1,
        sentAt: parseInt(obj.sentAt, 10) || -1,
    };
}

function App() {
    const [currentPage, setCurrentPage] = useState<string>("none");
    const [, forceUpdate] = useState<number>(0);
    const notificationRef = useRef<NotificationHandle | null>(null);
    const homePageRef = useRef<HomePageHandler | null>(null);
    const currentPageRef = useRef<string>(currentPage);

    async function requestUserPermission() {
        // Request user permission for Firebase notifications
        const authStatus = await requestPermission(getMessaging());
        const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;

        // Send Firebase token to server
        if (enabled) {
            sendFirebaseToken();
        }

        // Request user permission for Notifee notifications
        await notifee.requestPermission();

        // Create a default channel for notifications
        const channel = await notifee.createChannel({
            id: "min",
            name: "Min Channel",
            importance: 4,
        });
        await AsyncStorage.setItem("channelId", channel);
    }

    const sendFirebaseToken = async () => {
        // Get Firebase token
        const token = await getToken(getMessaging());

        // Send Firebase token to server
        const socket = await getSocket();
        socket.emit("addFcmToken", { token });
    };

    useEffect(() => {
        async function loadDefaultPage() {
            if (await Auth.getFromStorage("token")) {
                setCurrentPage("home");
            } else {
                setCurrentPage("sign");
            }
        }

        Auth.init();
        Translation.init();
        loadDefaultPage();

        requestUserPermission();

        const messaging = getMessaging();

        // Foreground Message Handler
        const ForegroundMessageHandlerUnsubscribe = onMessage(messaging, async remoteMessage => {
            const data = CreateRemoteMessagePayload(remoteMessage.data);
            notificationRef.current?.setTitle(data.authorName);
            notificationRef.current?.setText(data.text);
            notificationRef.current?.setImage(`${SERVER}/avatars/${data.authorId}.webp` || null);
            if (homePageRef.current?.getCurrentChat().id !== data.chatId) {
                notificationRef.current?.show();
            }
        });

        // Background Message Handler
        setBackgroundMessageHandler(messaging, async remoteMessage => {
            if (!remoteMessage.data) return;
            const data = CreateRemoteMessagePayload(remoteMessage.data);
            await notifee.displayNotification({
                title: data.authorName,
                body: data.text,
                android: {
                    smallIcon: "ic_notification",
                    //largeIcon: `${SERVER}/avatars/${data.authorId}.webp`,
                    channelId: (await AsyncStorage.getItem("channelId")) || "min",
                    circularLargeIcon: true,
                    pressAction: {
                        id: "default",
                    },
                    style: {
                        type: AndroidStyle.MESSAGING,
                        person: {
                            name: "me",
                        },
                        messages: [
                            {
                                text: data.text,
                                timestamp: data.sentAt,
                                person: {
                                    name: data.authorName,
                                    icon: `${SERVER}/avatars/${data.authorId}.webp`,
                                },
                            },
                        ],
                    },
                    category: AndroidCategory.MESSAGE,
                },
            });
        });

        // Back button/gesture handler
        const BackButtonHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (currentPageRef.current === "home") {
                return homePageRef.current?.back();
            }
            return false;
        });

        return () => {
            ForegroundMessageHandlerUnsubscribe();
            BackButtonHandler.remove();
        };
    }, []);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    function commandHandler(command: CommandData) {
        switch (command.action) {
            case "go":
                setCurrentPage(command.to || "home");
                break;
            case "changeLanguage":
                forceUpdate(Date.now());
                break;
        }
    }

    return (
        <SafeAreaProvider key={forceUpdate.toString()} style={{ backgroundColor: Colors.backgroundColor }}>
            <StatusBar barStyle={"light-content"} />
            <Notification ref={notificationRef} title="Default Title" text="Default Text" />
            {currentPage === "home" && (
                <PageWrapper>
                    <HomePage ref={homePageRef} handler={commandHandler} />
                </PageWrapper>
            )}
            {currentPage === "sign" && (
                <PageWrapper>
                    <SignPage handler={commandHandler} />
                </PageWrapper>
            )}
        </SafeAreaProvider>
    );
}

export default App;
