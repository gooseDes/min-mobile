import { StatusBar } from "react-native";
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
import notifee from "@notifee/react-native";
import { getSocket } from "./Socket";
import Notification, { NotificationHandle } from "@components/Notification";

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

function CreateRemoteMessageAdditionalData(obj: any): RemoteMessageAdditionalData {
    return {
        chatId: parseInt(obj.chatId, 10) || -1,
        authorId: parseInt(obj.userId, 10) || -1,
        messageId: parseInt(obj.messageId, 10) || -1,
        sentAt: parseInt(obj.sentAt, 10) || -1,
    };
}

function App() {
    const [currentPage, setCurrentPage] = useState<string>("none");
    const [, forceUpdate] = useState<number>(0);
    const [channelId, setChannelId] = useState<string | null>(null);
    const notificationRef = useRef<NotificationHandle | null>(null);
    const homePageRef = useRef<HomePageHandler | null>(null);

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
            id: "default",
            name: "Default Channel",
        });
        setChannelId(channel);
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
        loadDefaultPage();

        requestUserPermission();

        const messaging = getMessaging();

        // Foreground Message Handler
        const unsubscribe = onMessage(messaging, async remoteMessage => {
            notificationRef.current?.setTitle(remoteMessage.notification?.title || "Title");
            notificationRef.current?.setText(remoteMessage.notification?.body || "Body");
            const additional = CreateRemoteMessageAdditionalData(remoteMessage.data);
            if (homePageRef.current?.getCurrentChat().id !== additional.chatId) {
                notificationRef.current?.show();
            }
        });

        // Background Message Handler
        setBackgroundMessageHandler(messaging, async remoteMessage => {
            await notifee.displayNotification({
                title: remoteMessage.notification?.title || "Title",
                body: remoteMessage.notification?.body || "Body",
                android: {
                    channelId: channelId || "",
                    pressAction: {
                        id: "default",
                    },
                },
            });
        });

        return unsubscribe;
    }, []);

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
