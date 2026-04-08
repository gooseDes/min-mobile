import Dropdown from "@components/Dropdown";
import Notification, { NotificationHandle } from "@components/Notification";
import migrations from "@drizzle/migrations";
import { SERVER } from "@env";
import notifee from "@notifee/react-native";
import SettingsPage from "@pages/SettingsPage";
import {
    AuthorizationStatus,
    FirebaseMessagingTypes,
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
} from "@react-native-firebase/messaging";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { dropdownRef } from "@services/DropdownService";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { useEffect, useRef } from "react";
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
import { CreateDatabase, CreateRemoteMessagePayload } from "./Utils";

enableScreens();

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
    const notificationRef = useRef<NotificationHandle | null>(null);
    const homePageRef = useRef<HomePageHandler | null>(null);
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
            if (!(await Auth.getFromStorage("token"))) {
                commandHandler({ action: "go", to: "Sign" });
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

        return () => {
            ForegroundMessageHandlerUnsubscribe();
        };
    }, []);

    function commandHandler(command: CommandData) {
        switch (command.action) {
            case "go":
                if (command.to === "Home" || command.to === "Sign") {
                    const to = command.to;
                    async function waitForNavigationRef(): Promise<void> {
                        return new Promise(resolve => {
                            const check = setInterval(() => {
                                if (navigationRef.isReady()) {
                                    clearInterval(check);
                                    resolve();
                                }
                            }, 10);
                        });
                    }
                    waitForNavigationRef().then(() => {
                        navigationRef.reset({
                            index: 0,
                            routes: [{ name: to }],
                        });
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
                <Dropdown ref={dropdownRef} />
            </SafeAreaProvider>
        </TranslationProvider>
    );
}

export default App;
