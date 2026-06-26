import { Messaging, RemoteMessage } from "@react-native-firebase/messaging";

export function getMessaging() {}

export function setBackgroundMessageHandler(_messaging: Messaging, _handler: () => Promise<void>) {}

export function onMessage(_messaging: Messaging, _handler: (message: RemoteMessage) => Promise<void>) {
    return () => {};
}

export function requestPermission(_messaging: Messaging) {}
