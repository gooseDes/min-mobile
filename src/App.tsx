import Dropdown from "@components/Dropdown";
import ImageOverlay from "@components/ImageOverlay";
import Notification from "@components/Notification";
import Overlay from "@components/Overlay";
import Popup from "@components/Popup";
import PressableOverlay from "@components/PressableOverlay";
import { TranslationProvider } from "@contexts/TranslationContext";
import migrations from "@drizzle/migrations";
import { SERVER } from "@env";
import { setActiveBackgroundHandler } from "@index";
import notifee, { AndroidCategory, AndroidImportance, AndroidStyle } from "@notifee/react-native";
import ProfilePage from "@pages/ProfilePage";
import SettingsPage from "@pages/SettingsPage";
import {
    AuthorizationStatus,
    FirebaseMessagingTypes,
    getMessaging,
    onMessage,
    requestPermission,
} from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { dropdownRef } from "@services/DropdownService";
import { pressableOverlayRef } from "@services/InterceptClickService";
import { initialRouteName, navigate, navigationRef } from "@services/NavigationService";
import { notificationRef, showNotification } from "@services/NotifyService";
import { imageOverlayRef, overlayRef, setOverlay, setOverlayProgress } from "@services/OverlayService";
import { popupRef } from "@services/PopupService";
import { UpdateModule } from "@specs/UpdateModule";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import Auth from "./Auth";
import db from "./db/Client";
import HomePage, { HomePageHandler } from "./pages/HomePage";
import SignPage from "./pages/SignPage";
import { apiClient, initSocket } from "./Socket";
import Storage from "./Storage";
import { ThemeData, useThemeStore } from "./Style";
import { generateAdaptiveTheme } from "./Themes";
import Translation from "./Translation";
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
    const [canContinue, setCanContinue] = useState<boolean>(false);
    const [isContentBlurred, setIsContentBlurred] = useState<boolean>(false);
    const systemColorScheme = useColorScheme();
    const { theme, setTheme } = useThemeStore();

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
            initializeFirebase();
        }
    }

    const initializeFirebase = async () => {
        setActiveBackgroundHandler(async (remoteMessage: any) => {
            if (!remoteMessage.data) return;
            const data = CreateRemoteMessagePayload(remoteMessage.data);

            await notifee.displayNotification({
                android: {
                    smallIcon: "ic_notification",
                    channelId: "min",
                    largeIcon: `${SERVER}/avatars/${data.authorAvatar}.webp`,
                    importance: AndroidImportance.HIGH,
                    category: AndroidCategory.MESSAGE,
                    showTimestamp: true,

                    style: {
                        type: AndroidStyle.MESSAGING,
                        person: {
                            name: "me",
                        },
                        messages: [
                            {
                                text: data.text,
                                timestamp: data.sentAt * 1000,
                                person: {
                                    name: data.authorName,
                                    icon: `${SERVER}/avatars/${data.authorAvatar}.webp`,
                                },
                            },
                        ],
                    },
                    pressAction: {
                        id: "default",
                    },
                },
            });
        });
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
        initSocket().then(() => {
            setCanContinue(true);
            apiClient.socket.subscribe(
                "userInfo",
                data => {
                    if (data.user.id === Auth.id) {
                        Storage.set("avatar", data.user.avatar);
                    }
                },
                { once: true },
            );
            apiClient.socket.emit("getUserInfo", { id: Auth.id });
        });
        migrateDatabaseAndLoadDefaultPage();

        const messaging = getMessaging();

        requestUserPermission(messaging);

        // Foreground Message Handler
        const ForegroundMessageHandlerUnsubscribe = onMessage(messaging, async remoteMessage => {
            const data = CreateRemoteMessagePayload(remoteMessage.data);
            notificationRef.current?.setTitle(data.authorName);
            notificationRef.current?.setText(data.text);
            notificationRef.current?.setImage(`${SERVER}/avatars/${data.authorAvatar}.webp` || null);
            if (homePageRef.current?.getCurrentChat().id !== data.chatId || homePageRef.current?.getCurrentTab() !== "chat") {
                notificationRef.current?.show();
            }
        });

        const updateListener = UpdateModule.addListener("onDownloadProgress", data => {
            if (data.status === "started") {
                setOverlay("downloading");
                setOverlayProgress(0);
            } else if (data.status === "downloading") {
                setOverlayProgress(data.progress / 100);
            } else if (data.status === "installing" || data.status === "completed") {
                setOverlay("none");
                setOverlayProgress(1);
            } else if (data.status === "error") {
                setOverlay("none");
                setOverlayProgress(0);
                showNotification("Error", "Failed to download update");
            }
        });

        return () => {
            ForegroundMessageHandlerUnsubscribe();
            updateListener.remove();
        };
    }, []);

    useEffect(() => {
        if (theme.name === "adaptive") {
            const newTheme = generateAdaptiveTheme();
            Object.entries(newTheme).forEach(([key, value]) => {
                setTheme(key as keyof ThemeData, value);
            });
        }
    }, [systemColorScheme]);

    if (!canContinue) return null;

    return (
        <TranslationProvider>
            <GestureHandlerRootView>
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

                    {/* For fullscreening images */}
                    <ImageOverlay ref={imageOverlayRef} />

                    {/* This thing can intercept any clicks */}
                    <PressableOverlay ref={pressableOverlayRef} />

                    {/* This one is for displaying some processes (e.g. loading) */}
                    <Overlay ref={overlayRef} />

                    <Popup ref={popupRef} />
                    <Dropdown ref={dropdownRef} />
                    <Notification ref={notificationRef} title="Default Title" text="Default Text" />
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </TranslationProvider>
    );
});

export default App;
