/**
 * @format
 */

import App from "@/App";
import { appRef } from "@/Utils";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
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

export const setActiveBackgroundHandler = handler => {
    backgroundMessageHandler = handler;
};

let backgroundMessageHandler = null;

setBackgroundMessageHandler(messaging, async remoteMessage => {
    if (!remoteMessage.data) return;
    if (!backgroundMessageHandler) return;
    return backgroundMessageHandler(remoteMessage);
});

notifee.requestPermission();

function AppWrapper() {
    return <App ref={appRef} />;
}

AppRegistry.registerComponent(appName, () => AppWrapper);
