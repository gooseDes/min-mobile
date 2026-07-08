import { API_URL } from "@/env";
import { CreateRemoteMessagePayload } from "@/utils";
import notifee, { AndroidCategory, AndroidImportance, AndroidStyle } from "@notifee/react-native";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import { ExpoRoot } from "expo-router";
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";

async function createChannel() {
    await notifee.createChannel({
        id: "min",
        name: "Min Messages",
        importance: AndroidImportance.HIGH,
    });
}

createChannel();

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async remoteMessage => {
    console.log("[FCM] Background message received.");

    if (!remoteMessage.data) return;

    try {
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
                    person: { name: "me" },
                    messages: [
                        {
                            text: data.text,
                            timestamp: Number(data.sentAt) * 1000,
                            person: {
                                name: data.authorName,
                                icon: `${API_URL}/avatars/${data.authorAvatar}.webp`,
                            },
                        },
                    ],
                },
                pressAction: { id: "default" },
            },
        });
    } catch (error) {
        console.error("[FCM] Error displaying notification:", error);
    }
});

notifee.requestPermission();

export function App() {
    const ctx = (require as any).context("./src/app");
    return <ExpoRoot context={ctx} />;
}

AppRegistry.registerComponent(appName, () => App);
