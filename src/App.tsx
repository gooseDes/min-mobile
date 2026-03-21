import Notification, { NotificationHandle } from "@components/Notification";
import migrations from "@drizzle/migrations";
import { SERVER } from "@env";
import notifee, { AndroidImportance, AndroidStyle } from "@notifee/react-native";
import SettingsPage from "@pages/SettingsPage";
import {
    AuthorizationStatus,
    FirebaseMessagingTypes,
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
    setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import Auth from "./Auth";
import db from "./db/Client";
import HomePage, { HomePageHandler } from "./pages/HomePage";
import SignPage from "./pages/SignPage";
import { getSocket } from "./Socket";
import Storage from "./Storage";
import { Colors } from "./Style";
import Translation from "./Translation";
import { TranslationProvider } from "./TranslationContext";
import { CreateDatabase } from "./Utils";

enableScreens();

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

const Stack = createNativeStackNavigator();

const stackOptions: NativeStackNavigationOptions = {
    headerShown: false,
    headerBackButtonMenuEnabled: false,
    gestureEnabled: false,
};

type RootStackParamList = {
    Home: undefined;
    Sign: undefined;
    Settings: undefined;
};

function App() {
    const [currentPage, setCurrentPage] = useState<string>("none");
    const notificationRef = useRef<NotificationHandle | null>(null);
    const homePageRef = useRef<HomePageHandler | null>(null);
    const currentPageRef = useRef<string>(currentPage);
    const navigationRef = createNavigationContainerRef<RootStackParamList>();

    async function requestUserPermission(messaging: FirebaseMessagingTypes.Module) {
        // Request user permission for Firebase notifications
        const authStatus = await requestPermission(messaging);
        const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;

        // Send Firebase token to server
        if (enabled) {
            sendFirebaseToken(messaging);
        }

        // Request user permission for Notifee notifications
        await notifee.requestPermission();

        // Create a default channel for notifications
        const channel = await notifee.createChannel({
            id: "min",
            name: "Min Channel",
            importance: 4,
        });
        Storage.set("channelId", channel);
    }

    const sendFirebaseToken = async (messaging: FirebaseMessagingTypes.Module) => {
        // Get Firebase token
        const token = await getToken(messaging);

        // Send Firebase token to server
        const socket = await getSocket();
        socket.emit("addFcmToken", { token });
    };

    useEffect(() => {
        async function migrateDatabaseAndLoadDefaultPage() {
            if (Storage.getBoolean("createNewDB")) {
                try {
                    await migrate(db, migrations);
                } catch (e) {
                    console.warn("Standard migration failed:", e);
                    await CreateDatabase();
                }
                Storage.remove("createNewDB");
            } else {
                try {
                    await migrate(db, migrations);
                } catch (e) {
                    console.warn("Standard migration failed:", e);
                }
            }
            if (await Auth.getFromStorage("token")) {
                setCurrentPage("Home");
            } else {
                setCurrentPage("Sign");
            }
        }

        Auth.init();
        Translation.init();
        migrateDatabaseAndLoadDefaultPage();

        const messaging = getMessaging();

        requestUserPermission(messaging);

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
                    largeIcon: `${SERVER}/avatars/${data.authorId}.png`,
                    channelId: Storage.getString("channelId") || "min",
                    //circularLargeIcon: true,
                    importance: AndroidImportance.HIGH,
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
                                    icon: `${SERVER}/avatars/${data.authorId}.png`,
                                },
                            },
                        ],
                    },
                    pressAction: {
                        id: "default",
                    },
                    //category: AndroidCategory.MESSAGE,
                },
            });
        });

        return () => {
            ForegroundMessageHandlerUnsubscribe();
        };
    }, []);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    function commandHandler(command: CommandData) {
        switch (command.action) {
            case "go":
                if (command.to === "Home" || command.to === "Sign") {
                    navigationRef.reset({
                        index: 0,
                        routes: [{ name: command.to }],
                    });
                } else {
                    navigationRef.navigate(command.to as any);
                }
                break;
            case "back":
                navigationRef.goBack();
                break;
            case "notify":
                notificationRef.current?.setText(command.text ?? "");
                notificationRef.current?.setTitle(command.title ?? "");
                notificationRef.current?.setImage(command.image ?? null);
                notificationRef.current?.show();
                break;
        }
    }

    return (
        <TranslationProvider>
            <SafeAreaProvider style={{ backgroundColor: Colors.backgroundColor }}>
                <StatusBar barStyle={"light-content"} />
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName="Home">
                        <Stack.Screen name="Home" options={stackOptions}>
                            {() => <HomePage ref={homePageRef} handler={commandHandler} />}
                        </Stack.Screen>
                        <Stack.Screen name="Sign" options={stackOptions}>
                            {() => <SignPage handler={commandHandler} />}
                        </Stack.Screen>
                        <Stack.Screen name="Settings" options={stackOptions}>
                            {() => <SettingsPage handler={commandHandler} />}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>
                <Notification ref={notificationRef} title="Default Title" text="Default Text" />
            </SafeAreaProvider>
        </TranslationProvider>
    );
}

export default App;
