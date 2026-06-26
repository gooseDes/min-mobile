import { getMessaging, setBackgroundMessageHandler } from "@/fcm";
import { getBackgroundMessageHandler } from "@/fcmBackgroundHandler";
import notifee, { AndroidImportance } from "@notifee/react-native";
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
    if (!remoteMessage.data) {
        console.warn("[FCM] Background: No data in message");
        return;
    }
    
    const handler = getBackgroundMessageHandler();
    if (handler) {
        try {
            await handler(remoteMessage);
            console.log("[FCM] Background: Message handled");
        } catch (error) {
            console.error("[FCM] Background: Error handling message", error);
        }
    } else {
        console.warn("[FCM] Background: No handler registered yet");
    }
});

notifee.requestPermission();

export function App() {
    const ctx = require.context("./src/app");
    return <ExpoRoot context={ctx} />;
}

AppRegistry.registerComponent(appName, () => App);
