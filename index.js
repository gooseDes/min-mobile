/**
 * @format
 */

import { appRef } from "@/Utils";
import { SERVER } from "@env";
import notifee, { AndroidCategory, AndroidImportance, AndroidStyle } from "@notifee/react-native";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import App from "./src/App";

async function createChannel() {
    await notifee.createChannel({
        id: "min",
        name: "Min Messages",
        importance: AndroidImportance.HIGH,
    });
}

createChannel();

const messaging = getMessaging();

// Set the background message handler
setBackgroundMessageHandler(messaging, async remoteMessage => {
    if (!remoteMessage.data) return;
    const data = remoteMessage.data;

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
                        timestamp: parseInt(data.sentAt, 10) * 1000,
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

function AppWrapper() {
    return <App ref={appRef} />;
}

AppRegistry.registerComponent(appName, () => AppWrapper);
