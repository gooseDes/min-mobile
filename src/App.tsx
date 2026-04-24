import Dropdown from "@components/Dropdown";
import Notification from "@components/Notification";
import PressableOverlay from "@components/PressableOverlay";
import migrations from "@drizzle/migrations";
import { SERVER } from "@env";
import notifee from "@notifee/react-native";
import ProfilePage from "@pages/ProfilePage";
import SettingsPage from "@pages/SettingsPage";
import {
    AuthorizationStatus,
    FirebaseMessagingTypes,
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
} from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { dropdownRef } from "@services/DropdownService";
import { PressableOverlayRef } from "@services/InterceptClickService";
import { initialRouteName, navigate, navigationRef } from "@services/NavigationService";
import { notificationRef } from "@services/NotifyService";
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

function App() {
    const homePageRef = useRef<HomePageHandler | null>(null);

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
                navigate("Sign");
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
            notificationRef.current?.setImage(`${SERVER}/avatars/${data.authorAvatar}.webp` || null);
            if (homePageRef.current?.getCurrentChat().id !== data.chatId) {
                notificationRef.current?.show();
            }
        });

        getSocket().then(socket => {
            socket.on("userInfo", data => {
                if (data.user.id === Auth.id) {
                    Storage.set("avatar", data.user.avatar);
                }
                socket.off("userInfo");
            });
            socket.emit("getUserInfo", { id: Auth.id });
        });

        return () => {
            ForegroundMessageHandlerUnsubscribe();
        };
    }, []);

    return (
        <TranslationProvider>
            <SafeAreaProvider style={{ backgroundColor: Colors.backgroundColor }}>
                <StatusBar barStyle={"light-content"} />
                <NavigationContainer ref={navigationRef} onReady={() => navigate(initialRouteName)}>
                    <Stack.Navigator initialRouteName="Home">
                        <Stack.Screen name="Home" options={stackOptions}>
                            {() => <HomePage ref={homePageRef} />}
                        </Stack.Screen>
                        <Stack.Screen name="Sign" options={stackOptions}>
                            {() => <SignPage />}
                        </Stack.Screen>
                        <Stack.Screen name="Settings" options={stackOptions}>
                            {() => <SettingsPage />}
                        </Stack.Screen>
                        <Stack.Screen name="Profile" options={stackOptions}>
                            {() => <ProfilePage />}
                        </Stack.Screen>
                    </Stack.Navigator>
                </NavigationContainer>

                {/* This thing can intercept any clicks */}
                <PressableOverlay ref={PressableOverlayRef} />

                <Notification ref={notificationRef} title="Default Title" text="Default Text" />
                <Dropdown ref={dropdownRef} />
            </SafeAreaProvider>
        </TranslationProvider>
    );
}

export default App;
