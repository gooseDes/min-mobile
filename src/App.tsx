import Dropdown from "@components/Dropdown";
import Notification from "@components/Notification";
import Overlay from "@components/Overlay";
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
import { pressableOverlayRef } from "@services/InterceptClickService";
import { initialRouteName, navigate, navigationRef } from "@services/NavigationService";
import { notificationRef, showNotification } from "@services/NotifyService";
import { overlayRef, setOverlay, setProgress } from "@services/OverlayService";
import { UpdateModule } from "@specs/UpdateModule";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StatusBar } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import Auth from "./Auth";
import db from "./db/Client";
import HomePage, { HomePageHandler } from "./pages/HomePage";
import SignPage from "./pages/SignPage";
import { getSocket } from "./Socket";
import Storage from "./Storage";
import { useThemeStore } from "./Style";
import Translation from "./Translation";
import { TranslationProvider } from "./TranslationContext";
import { checkForUpdates, CreateDatabase, CreateRemoteMessagePayload } from "./Utils";

enableScreens();

const Stack = createNativeStackNavigator();

const stackOptions: NativeStackNavigationOptions = {
    headerShown: false,
    headerBackButtonMenuEnabled: false,
    gestureEnabled: false,
};

export interface AppHandler {
    setBlurEnabled: (enabled: boolean) => void;
}

export interface AppProps {}

const App = forwardRef<AppHandler, AppProps>((_props, ref) => {
    const homePageRef = useRef<HomePageHandler | null>(null);
    const [isContentBlurred, setIsContentBlurred] = useState<boolean>(false);
    const theme = useThemeStore(s => s.theme);

    useImperativeHandle(ref, () => ({
        setBlurEnabled: (enabled: boolean) => {
            setIsContentBlurred(enabled);
        },
    }));

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
        checkForUpdates(true);

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

        const updateListener = UpdateModule.addListener("onDownloadProgress", data => {
            if (data.status === "started") {
                setOverlay("downloading");
                setProgress(0);
            } else if (data.status === "downloading") {
                setProgress(data.progress / 100);
            } else if (data.status === "installing") {
                setOverlay("none");
                setProgress(1);
            } else if (data.status === "error") {
                setOverlay("none");
                setProgress(0);
                showNotification("Error", "Failed to download update");
            }
        });

        return () => {
            ForegroundMessageHandlerUnsubscribe();
            updateListener.remove();
        };
    }, []);

    return (
        <TranslationProvider>
            <SafeAreaProvider style={{ backgroundColor: theme.backgroundColor }}>
                <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
                <Animated.View
                    style={{
                        flex: 1,
                        filter: isContentBlurred ? "blur(8px)" : "blur(0px)",
                        transition: "filter 0.3s ease-in-out",
                    }}
                >
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
                </Animated.View>

                {/* This thing can intercept any clicks */}
                <PressableOverlay ref={pressableOverlayRef} />

                {/* This one is for displaying some processes (e.g. loading) */}
                <Overlay ref={overlayRef} />

                <Notification ref={notificationRef} title="Default Title" text="Default Text" />
                <Dropdown ref={dropdownRef} />
            </SafeAreaProvider>
        </TranslationProvider>
    );
});

export default App;
