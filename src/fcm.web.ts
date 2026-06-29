import type { Messaging, RemoteMessage } from "@react-native-firebase/messaging";

export function getMessaging() {
    return undefined as unknown as Messaging;
}

export function getToken(_messaging: Messaging) {
    return Promise.resolve("");
}

export function setBackgroundMessageHandler(_messaging: Messaging, _handler: () => Promise<void>) {
    return;
}

export function onMessage(_messaging: Messaging, _handler: (message: RemoteMessage) => Promise<void>) {
    return () => {};
}

export function requestPermission(_messaging: Messaging) {
    return Promise.resolve();
}
