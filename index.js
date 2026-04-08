/**
 * @format
 */

import { SERVER } from "@env";
import notifee, { AndroidImportance, AndroidStyle } from "@notifee/react-native";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import App from "./src/App";

const messaging = getMessaging();

// Set the background message handler
setBackgroundMessageHandler(messaging, async remoteMessage => {
    if (!remoteMessage.data) return;
    const data = remoteMessage.data;
    await notifee.displayNotification({
        title: data.authorName,
        body: data.text,
        android: {
            smallIcon: "ic_notification",
            largeIcon: `${SERVER}/avatars/${data.authorId}.png`,
            channelId: "min",
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
                        timestamp: parseInt(data.sentAt, 10),
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

AppRegistry.registerComponent(appName, () => App);
