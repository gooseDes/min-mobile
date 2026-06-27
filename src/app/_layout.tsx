import Auth from "@/auth";
import { API_URL } from "@/env";
import { getMessaging, onMessage, requestPermission } from "@/fcm";
import { setActiveBackgroundHandler } from "@/fcmBackgroundHandler";
import { initSocket } from "@/socket";
import Storage from "@/storage";
import { ThemeData, useThemeStore } from "@/style";
import { generateAdaptiveTheme } from "@/themes";
import Translation from "@/translation";
import { appRef, checkForUpdates, CreateDatabase, CreateRemoteMessagePayload, homePageRef } from "@/utils";
import Dropdown from "@components/Dropdown";
import ImageOverlay from "@components/ImageOverlay";
import Notification from "@components/Notification";
import Overlay from "@components/Overlay";
import Popup from "@components/Popup";
import PressableOverlay from "@components/PressableOverlay";
import { TranslationProvider } from "@contexts/TranslationContext";
import getDb from "@db/client";
import migrations from "@drizzle/migrations";
import notifee, { AndroidCategory, AndroidImportance, AndroidStyle } from "@notifee/react-native";
import { AuthorizationStatus, FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { dropdownRef } from "@services/dropdownService";
import { pressableOverlayRef } from "@services/interceptClickService";
import { notificationRef, showNotification } from "@services/notifyService";
import { imageOverlayRef, overlayRef, setOverlay, setOverlayProgress } from "@services/overlayService";
import { popupRef } from "@services/popupService";
import { UpdateModule } from "@specs/UpdateModule";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { Stack, useRouter } from "expo-router";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export interface AppHandler {
    setBlurEnabled: (enabled: boolean) => void;
}

export interface AppProps {}

function RootLayout() {
    return <App ref={appRef} />;
}

const App = forwardRef<AppHandler, AppProps>((_props, ref) => {
    const router = useRouter();
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
        try {
            console.log("[FCM] Requesting user permission...");
            const authStatus = await requestPermission(messaging);
            console.log("[FCM] Authorization status:", authStatus);

            const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log("[FCM] Permission granted, initializing Firebase handlers");
                initializeFirebase();
            } else {
                console.warn("[FCM] Permission not granted. Status:", authStatus);
            }
        } catch (error) {
            console.error("[FCM] Error requesting permission:", error);
        }
    }

    const initializeFirebase = async () => {
        try {
            setActiveBackgroundHandler(async (remoteMessage: any) => {
                if (!remoteMessage.data) {
                    console.warn("[FCM] Background handler: No data in message");
                    return;
                }

                try {
                    console.log("[FCM] Background handler: Processing message");
                    const data = CreateRemoteMessagePayload(remoteMessage.data);

                    await notifee.displayNotification({
                        android: {
                            smallIcon: "ic_notification",
                            channelId: "min",
                            largeIcon: `${API_URL}/avatars/${data.authorAvatar}.webp`,
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
                                            icon: `${API_URL}/avatars/${data.authorAvatar}.webp`,
                                        },
                                    },
                                ],
                            },
                            pressAction: {
                                id: "default",
                            },
                        },
                    });
                    console.log("[FCM] Background handler: Notification displayed successfully");
                } catch (error) {
                    console.error("[FCM] Background handler error:", error);
                }
            });
            console.log("[FCM] Background handler registered");
        } catch (error) {
            console.error("[FCM] Error initializing Firebase handlers:", error);
        }
    };

    useEffect(() => {
        checkForUpdates(true);

        async function migrateDatabaseAndLoadDefaultPage() {
            const db = await getDb();
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
                router.push("auth");
            }
        }

        Auth.init();
        Translation.init();
        initSocket();
        migrateDatabaseAndLoadDefaultPage();

        const messaging = getMessaging();

        requestUserPermission(messaging);

        // Foreground Message Handler
        const ForegroundMessageHandlerUnsubscribe = onMessage(messaging, async remoteMessage => {
            try {
                console.log("[FCM] Foreground handler: Message received", remoteMessage);
                if (!remoteMessage.data) {
                    console.warn("[FCM] Foreground handler: No data in message");
                    return;
                }

                const data = CreateRemoteMessagePayload(remoteMessage.data);
                notificationRef.current?.setTitle(data.authorName);
                notificationRef.current?.setText(data.text);
                notificationRef.current?.setImage(`${API_URL}/avatars/${data.authorAvatar}.webp` || null);

                const currentChat = homePageRef.current?.getCurrentChat();
                const currentTab = homePageRef.current?.getCurrentTab();

                if (currentChat?.id !== data.chatId || currentTab !== "chat") {
                    console.log("[FCM] Foreground handler: Showing notification (not in chat)");
                    notificationRef.current?.show();
                } else {
                    console.log("[FCM] Foreground handler: Message for current chat, notification hidden");
                }
            } catch (error) {
                console.error("[FCM] Foreground handler error:", error);
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
                        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.backgroundColor } }}>
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="auth" />
                        </Stack>
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

export default RootLayout;
